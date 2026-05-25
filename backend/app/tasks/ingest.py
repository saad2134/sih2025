import asyncio
from datetime import datetime, timezone
from sqlalchemy import select

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.course import Course
from app.config import settings


@celery_app.task(name="app.tasks.ingest.ingest_new_courses")
def ingest_new_courses():
    """
    Daily 02:00 UTC: Ingest new course URLs discovered via SERP.
    Only discovers URLs - does not scrape in live request path.
    """
    return {"status": "scheduled", "message": "SERP discovery not implemented"}


async def scrape_course_once_async(course_id: str, url: str):
    if not settings.FIRECRAWL_API_KEY:
        return {"status": "skipped", "reason": "FIRECRAWL_API_KEY not set"}

    async with get_db_context() as db:
        course = await db.get(Course, course_id)
        if not course:
            return {"status": "error", "message": "Course not found"}

        if course.last_scraped_at:
            days_since = (datetime.now(timezone.utc) - course.last_scraped_at).days
            if days_since < 30:
                return {"status": "skipped", "reason": "Recently scraped"}

        from firecrawl import FirecrawlApp
        app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
        
        result = app.scrape_url(url, params={"formats": ["markdown", "extract"]})
        
        if result and result.get("extract"):
            course.description = result["extract"].get("description", course.description)
            course.math_topics = result["extract"].get("math_topics", course.math_topics)
            course.style_tags = result["extract"].get("style_tags", course.style_tags)
        
        course.last_scraped_at = datetime.now(timezone.utc)
        await db.commit()

        return {
            "status": "success",
            "course_id": course_id,
            "scraped_at": str(course.last_scraped_at)
        }


@celery_app.task(name="app.tasks.ingest.scrape_course_once", bind=True, max_retries=3)
def scrape_course_once(self, course_id: str, url: str):
    """
    One-time Firecrawl scrape - cached forever in PostgreSQL.
    Only re-scrape if last_scraped_at > 30 days AND view_count > 10.
    """
    try:
        return asyncio.run(scrape_course_once_async(course_id, url))
    except Exception as exc:
        return {"status": "error", "message": str(exc)}


@celery_app.task(name="app.tasks.ingest.refresh_all_courses")
def refresh_all_courses():
    """
    Every 12h: Refresh completion_rate and avg_rating from provider APIs.
    Skips courses where last_scraped_at < 11h.
    """
    return {"status": "scheduled", "message": "Provider API refresh not implemented"}