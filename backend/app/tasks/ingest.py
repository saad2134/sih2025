from app.tasks.celery_app import celery_app
import pandas as pd
from app.db.session import async_session_maker
from app.models import Course


@celery_app.task(name="app.tasks.ingest.ingest_new_courses")
def ingest_new_courses():
    return {"status": "ingested", "count": 0}
