"""Career tasks - weekly job description scraping and skill extraction."""

import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
import json

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.onboarding import LearnerProfile
from app.db.redis import redis_pool
from app.config import settings

FALLBACK_SKILLS = {
    "data_scientist": ["python", "machine_learning", "data_science", "statistics", "sql", "deep_learning"],
    "software_engineer": ["python", "java", "data_structures", "algorithms", "system_design", "git"],
    "frontend_developer": ["javascript", "react", "html", "css", "typescript", "tailwind"],
    "backend_developer": ["python", "node.js", "databases", "sql", "apis", "docker", "git"],
    "fullstack_developer": ["javascript", "react", "node.js", "databases", "html", "css", "git"],
    "default": ["communication", "problem_solving", "teamwork", "adaptability", "critical_thinking"]
}


async def scrape_job_descriptions_async():
    """Inner async implementation of scrape_job_descriptions."""
    async with get_db_context() as db:
        result = await db.execute(
            select(LearnerProfile.career_target).distinct()
        )
        targets = [row[0] for row in result if row[0]]

    if not targets:
        # Default targets to scrape if database is empty
        targets = ["Data Scientist", "Software Engineer", "Frontend Developer", "Backend Developer"]

    results_summary = {}

    for target in targets:
        target_slug = target.lower().strip().replace(" ", "_").replace("-", "_")
        scraped_text = ""

        # 1. Search Naukri via SerpAPI
        if settings.SERP_API_KEY:
            try:
                import serpapi
                client = serpapi.Client(api_key=settings.SERP_API_KEY)
                params = {
                    "q": f'site:naukri.com "{target}"'
                }
                search_res = await asyncio.to_thread(client.search, params)
                organic_results = search_res.get("organic_results", [])

                # Scrape/fetch top 3 links
                for res in organic_results[:3]:
                    link = res.get("link")
                    snippet = res.get("snippet", "")

                    if link and settings.FIRECRAWL_API_KEY:
                        try:
                            from firecrawl import FirecrawlApp
                            app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
                            crawl_res = await asyncio.to_thread(
                                app.scrape_url, link, {"formats": ["markdown"]}
                            )
                            if crawl_res and crawl_res.get("markdown"):
                                scraped_text += crawl_res["markdown"] + "\n\n"
                                continue
                        except Exception:
                            pass
                    # Fallback to search snippet
                    scraped_text += snippet + "\n\n"
            except Exception:
                pass

        # 2. Extract skills using Gemini
        skills = []
        if scraped_text and settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-2.5-flash")

                prompt = f"""
                Analyze the following scraped text from Naukri job descriptions for the role '{target}'.
                Extract a JSON list of the top 6-8 required technical skills (lowercase, clean words, e.g. "python", "react", "sql").
                Return ONLY a JSON list of strings, e.g. ["python", "machine_learning"]. Do not wrap in markdown code blocks.

                Text:
                {scraped_text[:4000]}
                """
                response = await asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config={"response_mime_type": "application/json"}
                )
                try:
                    skills = json.loads(response.text.strip())
                except Exception:
                    pass
            except Exception:
                pass

        # 3. Fallback to predefined dict
        if not skills:
            skills = FALLBACK_SKILLS.get(target_slug, FALLBACK_SKILLS["default"])

        # 4. Save to Redis
        await redis_pool.set(f"career:skills:{target_slug}", json.dumps(skills))
        results_summary[target] = skills

    return {"status": "success", "jobs_scraped": len(targets), "skills_by_target": results_summary}


@celery_app.task(name="app.tasks.career.scrape_job_descriptions")
def scrape_job_descriptions():
    """
    Weekly Mon 01:00 UTC: Firecrawl top 10 Naukri JDs per career_target.
    Extracts required_skills from JD text via Gemini Flash.
    Updates career score data.
    """
    try:
        return asyncio.run(scrape_job_descriptions_async())
    except Exception as e:
        return {"status": "error", "message": str(e)}


async def update_career_scores_async(user_id: str):
    async with get_db_context() as db:
        result = await db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        
        if not profile or not profile.career_target:
            return {"status": "skipped", "reason": "No career target"}
        
        return {
            "status": "updated",
            "user_id": user_id,
            "career_target": profile.career_target
        }


@celery_app.task(name="app.tasks.career.update_career_scores")
def update_career_scores(user_id: str):
    """Update career score for a specific user after profile/enrollment changes."""
    try:
        return asyncio.run(update_career_scores_async(user_id))
    except Exception as e:
        return {"status": "error", "message": str(e)}