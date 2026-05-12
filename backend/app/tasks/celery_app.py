"""Celery app and task definitions."""

from celery import Celery
from celery.schedules import crontab
from app.config import settings

celery_app = Celery(
    "shikshadisha",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.tasks.recommendations",
        "app.tasks.ingest",
        "app.tasks.tagger",
        "app.tasks.faiss_rebuild",
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
    "recompute-cluster-matrix": {
        "task": "app.tasks.recommendations.recompute_cluster_matrix",
        "schedule": crontab(hour=3, minute=0),
    },
    "rebuild-faiss-index": {
        "task": "app.tasks.faiss_rebuild.rebuild_faiss_index",
        "schedule": crontab(hour=4, minute=0),
    },
    "ingest-new-courses": {
        "task": "app.tasks.ingest.ingest_new_courses",
        "schedule": crontab(hour=2, minute=0),
    },
    "llm-tag-untagged": {
        "task": "app.tasks.tagger.llm_tag_untagged",
        "schedule": crontab(minute="*/10"),
    },
}