from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "shikshadisha",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.recommendations",
        "app.tasks.ingest",
        "app.tasks.tagger",
        "app.tasks.digest",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    "daily-ingest-02": {
        "task": "app.tasks.ingest.ingest_new_courses",
        "schedule": crontab(hour=2, minute=0),
    },
    "daily-faiss-rebuild-04": {
        "task": "app.tasks.recommendations.rebuild_faiss_index",
        "schedule": crontab(hour=4, minute=0),
    },
    "weekly-career-scrape": {
        "task": "app.tasks.career.scrape_job_descriptions",
        "schedule": crontab(hour=1, minute=0, day_of_week=1),
    },
    "weekly-digest": {
        "task": "app.tasks.digest.send_recommendation_digest",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
    },
}
