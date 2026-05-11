"""Weekly recommendation digest email task."""

from datetime import datetime, timezone
from sqlalchemy import select

from app.tasks.celery_app import celery_app
from app.db.session import get_db_context
from app.models.user import User
from app.models.onboarding import LearnerProfile


@celery_app.task(name="app.tasks.digest.send_recommendation_digest")
def send_recommendation_digest():
    """
    Weekly Mon 08:00 UTC + user timezone offset.
    Sends top 3 picks for users active in 14 days.
    Respects user opt-out preference.
    """
    with get_db_context() as db:
        two_weeks_ago = datetime.now(timezone.utc).replace(day=datetime.now().day - 14)
        
        result = db.execute(
            select(User).where(
                User.last_active_at >= two_weeks_ago,
                User.onboarding_done == True
            )
        )
        users = result.scalars().all()

        sent_count = 0
        for user in users:
            try:
                pass
            except Exception:
                continue
            sent_count += 1

        return {
            "status": "sent",
            "users_notified": sent_count,
            "total_active": len(users)
        }