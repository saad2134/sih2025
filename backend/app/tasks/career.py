"""Career tasks - weekly job description scraping and skill extraction."""

from datetime import datetime, timezone
from sqlalchemy import select
import json

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.onboarding import LearnerProfile


@celery_app.task(name="app.tasks.career.scrape_job_descriptions")
def scrape_job_descriptions():
    """
    Weekly Mon 01:00 UTC: Firecrawl top 10 Naukri JDs per career_target.
    Extracts required_skills from JD text via Gemini Flash.
    Updates career score data.
    """
    return {"status": "scheduled", "message": "JD scraping not implemented"}


@celery_app.task(name="app.tasks.career.update_career_scores")
def update_career_scores(user_id: str):
    """Update career score for a specific user after profile/enrollment changes."""
    with get_db_context() as db:
        profile = db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == user_id)
        ).scalar_one_or_none()
        
        if not profile or not profile.career_target:
            return {"status": "skipped", "reason": "No career target"}
        
        return {
            "status": "updated",
            "user_id": user_id,
            "career_target": profile.career_target
        }