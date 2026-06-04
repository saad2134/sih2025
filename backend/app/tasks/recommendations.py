"""Recommendation compute task - runs async after onboarding submit."""

import uuid
import asyncio
from datetime import datetime, timezone
from sqlalchemy import select, update, text

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.onboarding import RecommendationJob, LearnerProfile
from app.models.recommendation import Enrolment
from app.services.matching import MatchingService


async def compute_recommendations_async(job_id: str, profile_id: str):
    from app.models.course import Course
    
    async with get_db_context() as db:
        job = await db.get(RecommendationJob, uuid.UUID(job_id))
        if not job:
            return {"status": "error", "message": "Job not found"}

        job.status = "running"
        await db.commit()

        profile = await db.get(LearnerProfile, uuid.UUID(profile_id))
        if not profile:
            job.status = "failed"
            job.error = "Profile not found"
            await db.commit()
            return {"status": "error", "message": "Profile not found"}

        # Dynamic course discovery using SerpAPI + Firecrawl + Gemini
        if profile.career_target:
            try:
                import logging
                logger = logging.getLogger("app.tasks.recommendations")
                from app.services.course_discovery import CourseDiscoveryService
                discovery_service = CourseDiscoveryService(db)
                skills = [profile.topic] if profile.topic else []
                logger.info(f"Triggering course discovery for target: {profile.career_target}")
                await discovery_service.discover_and_save_courses(profile.career_target, skills)
                # Flush to ensure new courses are available in session
                await db.flush()
            except Exception as e:
                import logging
                logging.getLogger("app.tasks.recommendations").error(f"External course discovery failed: {e}")

        matching_service = MatchingService(db)
        recommendations = await matching_service.get_recommendations(profile, limit=20)

        result_ids = []
        for rec in recommendations:
            result_ids.append(uuid.UUID(rec.id))

        # Re-fetch or refresh job to avoid session issues, then update status
        job = await db.get(RecommendationJob, uuid.UUID(job_id))
        job.status = "ready"
        job.results = result_ids
        job.completed_at = datetime.now(timezone.utc)
        await db.commit()

        return {
            "status": "success",
            "job_id": job_id,
            "count": len(result_ids)
        }


@celery_app.task(name="app.tasks.recommendations.compute_recommendations", bind=True, max_retries=3)
def compute_recommendations_task(self, job_id: str, profile_id: str):
    """Async recommendation computation - triggered by onboarding."""
    try:
        return asyncio.run(compute_recommendations_async(job_id, profile_id))
    except Exception as exc:
        async def fail_job():
            async with get_db_context() as db:
                job = await db.get(RecommendationJob, uuid.UUID(job_id))
                if job:
                    job.status = "failed"
                    job.error = str(exc)
                    await db.commit()
        try:
            asyncio.run(fail_job())
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=60)


async def recompute_cluster_matrix_async():
    async with get_db_context() as db:
        result = await db.execute(text("""
            SELECT 
                r.vark_cluster,
                COUNT(*) as total,
                SUM(CASE WHEN r.completion_status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM reviews r
            WHERE r.vark_cluster IS NOT NULL
            GROUP BY r.vark_cluster
        """))
        
        cluster_rates = {}
        for row in result:
            cluster = row[0]
            total = row[1]
            completed = row[2]
            if total >= 10:
                cluster_rates[cluster] = completed / total if total > 0 else 0.5

        return {"clusters_updated": len(cluster_rates), "rates": cluster_rates}


@celery_app.task(name="app.tasks.recommendations.recompute_cluster_matrix")
def recompute_cluster_matrix():
    """
    Daily: Rebuild cluster completion matrix from enrolments.
    Updates completion rates per VARK cluster for collaborative filtering.
    """
    try:
        return asyncio.run(recompute_cluster_matrix_async())
    except Exception as e:
        return {"status": "error", "message": str(e)}


async def update_cached_recommendations_async(user_id: str):
    pass


@celery_app.task(name="app.tasks.recommendations.update_cached_recommendations")
def update_cached_recommendations(user_id: str):
    """Invalidate and recompute recommendations for user."""
    try:
        return asyncio.run(update_cached_recommendations_async(user_id))
    except Exception as e:
        return {"status": "error", "message": str(e)}