from app.tasks.celery_app import celery_app


@celery_app.task(name="app.tasks.tagger.llm_tag_untagged")
def llm_tag_untagged():
    return {"status": "tagged", "count": 0}
