from app.tasks.celery_app import celery_app


@celery_app.task(name="app.tasks.career.scrape_job_descriptions")
def scrape_job_descriptions():
    return {"status": "scraped"}
