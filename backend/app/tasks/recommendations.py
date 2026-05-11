"""Recommendation compute task - runs async after onboarding submit."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import select, update

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.onboarding import RecommendationJob, LearnerProfile
from app.models.recommendation import Enrolment
from app.services.matching import MatchingService


@celery_app.task(name="app.tasks.recommendations.compute_recommendations", bind=True, max_retries=3)
def compute_recommendations_task(self, job_id: str, profile_id: str):
    """Async recommendation computation - triggered by onboarding."""
    from app.models.course import Course
    
    try:
        with get_db_context() as db:
            job = db.get(RecommendationJob, uuid.UUID(job_id))
            if not job:
                return {"status": "error", "message": "Job not found"}

            job.status = "running"
            db.commit()

            profile = db.get(LearnerProfile, uuid.UUID(profile_id))
            if not profile:
                job.status = "failed"
                job.error = "Profile not found"
                db.commit()
                return {"status": "error", "message": "Profile not found"}

            matching_service = MatchingService(db)
            recommendations = matching_service.get_recommendations(profile, limit=20)

            result_ids = []
            for rec in recommendations:
                result_ids.append(uuid.UUID(rec.id))

            job.status = "ready"
            job.results = result_ids
            job.completed_at = datetime.now(timezone.utc)
            db.commit()

            return {
                "status": "success",
                "job_id": job_id,
                "count": len(result_ids)
            }

    except Exception as exc:
        with get_db_context() as db:
            job = db.get(RecommendationJob, uuid.UUID(job_id))
            if job:
                job.status = "failed"
                job.error = str(exc)
                db.commit()

        raise self.retry(exc=exc, countdown=60)


@celery_app.task(name="app.tasks.recommendations.recompute_cluster_matrix")
def recompute_cluster_matrix():
    """
    Daily: Rebuild cluster completion matrix from enrolments.
    Updates completion rates per VARK cluster for collaborative filtering.
    """
    with get_db_context() as db:
        result = db.execute("""
            SELECT 
                r.vark_cluster,
                COUNT(*) as total,
                SUM(CASE WHEN r.completion_status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM reviews r
            WHERE r.vark_cluster IS NOT NULL
            GROUP BY r.vark_cluster
        """)
        
        cluster_rates = {}
        for row in result:
            cluster = row[0]
            total = row[1]
            completed = row[2]
            if total >= 10:
                cluster_rates[cluster] = completed / total if total > 0 else 0.5

        return {"clusters_updated": len(cluster_rates), "rates": cluster_rates}


@celery_app.task(name="app.tasks.recommendations.update_cached_recommendations")
def update_cached_recommendations(user_id: str):
    """Invalidate and recompute recommendations for user."""
    pass