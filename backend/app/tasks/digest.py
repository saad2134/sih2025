from app.tasks.celery_app import celery_app


@celery_app.task(name="app.tasks.digest.send_recommendation_digest")
def send_recommendation_digest():
    return {"status": "sent"}
