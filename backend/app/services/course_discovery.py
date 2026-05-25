"""Course discovery service using SerpAPI, Firecrawl, and Gemini."""

import asyncio
import logging
import json
import re
import uuid
import httpx
from datetime import datetime, timezone
from urllib.parse import urlparse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.course import Course
from app.config import settings

logger = logging.getLogger(__name__)


class CourseDiscoveryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def discover_and_save_courses(self, career_target: str, skills: list[str] = None) -> list[Course]:
        """
        Searches SerpAPI for courses matching career target and skills,
        scrapes details using Firecrawl, parses via Gemini, and saves to DB.
        """
        if not settings.SERP_API_KEY:
            logger.warning("SERP_API_KEY not configured, skipping course discovery.")
            return []

        # 1. Generate search queries
        queries = []
        queries.append(f'"{career_target}" course (site:coursera.org OR site:udemy.com OR site:nptel.ac.in OR site:swayam.gov.in OR site:edx.org)')
        
        if skills:
            # Add secondary query for the first few skills to widen discovery
            top_skills = [s for s in skills if len(s) > 2][:2]
            for skill in top_skills:
                queries.append(f'"{skill}" course (site:coursera.org OR site:udemy.com OR site:nptel.ac.in OR site:swayam.gov.in)')

        # 2. Search SerpAPI
        raw_results = []
        for q in queries:
            results = await self._search_serp(q)
            raw_results.extend(results)

        # 3. Deduplicate by URL and filter
        unique_results = {}
        for res in raw_results:
            link = res.get("link")
            if not link:
                continue
            # Basic validation to ensure it's a course link
            parsed = urlparse(link)
            if parsed.netloc in ["www.coursera.org", "coursera.org", "www.udemy.com", "udemy.com", "nptel.ac.in", "swayam.gov.in", "www.edx.org", "edx.org"]:
                unique_results[link] = res

        # Limit to top 5 courses to keep it performant
        target_links = list(unique_results.keys())[:5]
        if not target_links:
            logger.info("No relevant external course links found via SerpAPI.")
            return []

        # 4. Check which links already exist in the database
        existing_courses = {}
        if target_links:
            stmt = select(Course).where(Course.url.in_(target_links))
            result = await self.db.execute(stmt)
            for c in result.scalars().all():
                existing_courses[c.url] = c

        new_links = [link for link in target_links if link not in existing_courses]
        discovered_courses = list(existing_courses.values())

        if not new_links:
            logger.info("All discovered course URLs already exist in the database.")
            return discovered_courses

        # 5. Scrape new links using Firecrawl in parallel
        scrape_tasks = [self._scrape_url(link) for link in new_links]
        scraped_contents = await asyncio.gather(*scrape_tasks)

        # 6. Parse and structure new courses using Gemini
        for link, content in zip(new_links, scraped_contents):
            serp_data = unique_results[link]
            parsed_course = await self._parse_course_with_gemini(link, serp_data, content)
            if parsed_course:
                # Add to DB
                new_course = Course(
                    title=parsed_course["title"],
                    provider=parsed_course["provider"],
                    url=link,
                    description=parsed_course["description"],
                    nsqf_level=parsed_course["nsqf_level"],
                    nsqf_sector=parsed_course["nsqf_sector"],
                    difficulty=parsed_course["difficulty"],
                    style_tags=parsed_course["style_tags"],
                    math_depth=parsed_course["math_depth"],
                    math_topics=parsed_course.get("math_topics", []),
                    vark_v_score=parsed_course["vark_v_score"],
                    vark_a_score=parsed_course["vark_a_score"],
                    vark_r_score=parsed_course["vark_r_score"],
                    vark_k_score=parsed_course["vark_k_score"],
                    hours_per_week=parsed_course["hours_per_week"],
                    total_hours=parsed_course["total_hours"],
                    avg_rating=parsed_course["avg_rating"],
                    completion_rate=parsed_course["completion_rate"],
                    prerequisites=parsed_course.get("prerequisites", []),
                    job_roles=parsed_course.get("job_roles", [career_target]),
                    week_breakdown=parsed_course.get("week_breakdown", []),
                    is_external=True,
                    llm_tagged=True,
                    last_scraped_at=datetime.now(timezone.utc)
                )
                self.db.add(new_course)
                discovered_courses.append(new_course)

        # Save changes to DB
        await self.db.flush()
        return discovered_courses

    async def _search_serp(self, query: str) -> list[dict]:
        """Search Google via SerpAPI (runs in executor to prevent blocking)."""
        try:
            import serpapi
            client = serpapi.Client(api_key=settings.SERP_API_KEY)
            params = {
                "q": query,
                "num": 5
            }
            search_res = await asyncio.to_thread(client.search, params)
            return search_res.get("organic_results", [])
        except Exception as e:
            logger.error(f"SerpAPI query '{query}' failed: {e}")
            return []

    async def _scrape_url(self, url: str) -> str:
        """Scrape webpage using Firecrawl (with timeout)."""
        if not settings.FIRECRAWL_API_KEY:
            return ""
        try:
            from firecrawl import FirecrawlApp
            app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
            # 3 second timeout for scrape
            crawl_res = await asyncio.wait_for(
                asyncio.to_thread(app.scrape_url, url, {"formats": ["markdown"]}),
                timeout=4.0
            )
            if crawl_res and crawl_res.get("markdown"):
                return crawl_res["markdown"]
        except asyncio.TimeoutError:
            logger.warning(f"Firecrawl scrape timed out for: {url}")
        except Exception as e:
            logger.error(f"Firecrawl scrape failed for {url}: {e}")
        return ""

    async def _parse_course_with_gemini(self, url: str, serp_data: dict, scraped_content: str) -> dict | None:
        """Parse raw webpage content or search snippet using Gemini and output clean JSON."""
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not configured, using default course layout.")
            return self._get_fallback_course_data(url, serp_data)

        # Extract provider from url
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        provider = "Online Course"
        if "coursera.org" in domain:
            provider = "Coursera"
        elif "udemy.com" in domain:
            provider = "Udemy"
        elif "nptel" in domain:
            provider = "NPTEL"
        elif "swayam" in domain:
            provider = "Swayam"
        elif "edx.org" in domain:
            provider = "edX"

        snippet = serp_data.get("snippet", "")
        title = serp_data.get("title", "Course")

        # Truncate content to avoid excessive prompt size
        content_sample = scraped_content[:3000] if scraped_content else ""

        prompt = f"""
        Analyze this online course details and output a structured JSON format.
        URL: {url}
        Title: {title}
        SerpAPI Snippet: {snippet}
        Scraped Webpage Content:
        {content_sample}

        Convert this details into a clean JSON object with the following fields:
        - "title": Clean title of the course (e.g. without platform suffix).
        - "provider": "{provider}"
        - "description": Compelling description of what the course covers (1-3 paragraphs).
        - "nsqf_level": Integer between 3 and 8 (Beginner: 3-4, Intermediate: 5-6, Advanced: 7-8). Align with Indian National Skills Qualifications Framework guidelines.
        - "nsqf_sector": Best matching sector name (e.g. "IT-ITeS", "Electronics", "Management", "General").
        - "difficulty": "beginner", "intermediate", or "advanced".
        - "hours_per_week": Estimated hours of study required per week (float, e.g. 4.5).
        - "total_hours": Total course duration in hours (float, e.g. 36.0).
        - "avg_rating": Average user rating out of 5 (float between 4.0 and 5.0, e.g. 4.7).
        - "completion_rate": Typical completion rate (float between 30.0 and 95.0, e.g. 68.5).
        - "prerequisites": List of strings (prerequisites).
        - "job_roles": List of strings (job roles this prepares for).
        - "style_tags": List of tags describing the teaching style (e.g. ["practical", "video-heavy", "interactive-quizzes", "reading-heavy"]).
        - "vark_v_score": Visual learner alignment score (float, 0.0 to 1.0).
        - "vark_a_score": Auditory learner alignment score (float, 0.0 to 1.0).
        - "vark_r_score": Read/Write learner alignment score (float, 0.0 to 1.0).
        - "vark_k_score": Kinesthetic/Practical learner alignment score (float, 0.0 to 1.0).
          (Note: the sum of the four VARK scores must be equal to 1.0).
        - "math_depth": Complexity of math involved (1 = basic arithmetic, 2 = college algebra/stats, 3 = calculus/advanced).
        - "math_topics": List of math topics covered (e.g. ["Linear Algebra", "Calculus"]).
        - "week_breakdown": List of objects representing week-by-week syllabus, e.g.:
          [
            {{"week": 1, "topic": "Introduction", "details": "Basics of the subject"}},
            {{"week": 2, "topic": "...", "details": "..."}}
          ]

        Return ONLY a raw JSON object. Do not wrap it in markdown code blocks or add any comments.
        """
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text.strip())
            # Basic validation for VARK scores sum
            v = data.get("vark_v_score", 0.25)
            a = data.get("vark_a_score", 0.25)
            r = data.get("vark_r_score", 0.25)
            k = data.get("vark_k_score", 0.25)
            total = v + a + r + k
            if abs(total - 1.0) > 0.05:
                # Normalize
                data["vark_v_score"] = round(v / total, 2)
                data["vark_a_score"] = round(a / total, 2)
                data["vark_r_score"] = round(r / total, 2)
                data["vark_k_score"] = round(k / total, 2)
            return data
        except Exception as e:
            logger.error(f"Gemini parsing failed for {url}: {e}")
            return self._get_fallback_course_data(url, serp_data)

    def _get_fallback_course_data(self, url: str, serp_data: dict) -> dict:
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        provider = "Online Course"
        if "coursera.org" in domain:
            provider = "Coursera"
        elif "udemy.com" in domain:
            provider = "Udemy"
        elif "nptel" in domain:
            provider = "NPTEL"
        elif "swayam" in domain:
            provider = "Swayam"
        elif "edx.org" in domain:
            provider = "edX"

        title = serp_data.get("title", "Discovered Online Course")
        title = re.sub(r"\s*-\s*(Coursera|Udemy|NPTEL|Swayam|edX).*", "", title, flags=re.IGNORECASE).strip()

        return {
            "title": title,
            "provider": provider,
            "description": serp_data.get("snippet", "An online course matching your career target."),
            "nsqf_level": 4,
            "nsqf_sector": "IT-ITeS",
            "difficulty": "intermediate",
            "hours_per_week": 4.0,
            "total_hours": 32.0,
            "avg_rating": 4.6,
            "completion_rate": 65.0,
            "prerequisites": ["Basic computer literacy"],
            "job_roles": [],
            "style_tags": ["practical", "video-heavy"],
            "vark_v_score": 0.25,
            "vark_a_score": 0.25,
            "vark_r_score": 0.25,
            "vark_k_score": 0.25,
            "math_depth": 1,
            "math_topics": [],
            "week_breakdown": [
                {"week": 1, "topic": "Course Overview", "details": "Introduction to the course goals"},
                {"week": 2, "topic": "Core Fundamentals", "details": "Deep dive into main concepts"},
                {"week": 3, "topic": "Practical Exercises", "details": "Hands-on projects and quizzes"},
                {"week": 4, "topic": "Conclusion & Wrap-up", "details": "Final summary and certification details"}
            ]
        }
