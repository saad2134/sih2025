from sqlalchemy import select
from app.tasks.celery_app import celery_app
from app.db.session import async_session_maker, engine, Base
from app.models import (
    Course,
    LearnerProfile,
    RecommendationJob,
    RecommendationItem,
    GoalEnum,
)
from app.services.matching import filter_and_score_courses
from datetime import datetime
import asyncio


def sync_get_sync_session():
    from sqlalchemy.orm import Session
    from sqlalchemy import create_engine

    sync_engine = create_engine(
        "postgresql://postgres:postgres@localhost:5432/shikshadisha"
    )
    SessionLocal = Session(bind=sync_engine)
    return SessionLocal()


@celery_app.task(name="app.tasks.recommendations.compute_recommendations")
def compute_recommendations(job_id: str):
    pass


async def _run_recommendations(job_id: str):
    async with async_session_maker() as db:
        from sqlalchemy import select
        from uuid import UUID

        job_result = await db.execute(
            select(RecommendationJob).where(RecommendationJob.id == UUID(job_id))
        )
        job = job_result.scalar_one_or_none()
        if not job:
            return
        job.status = "running"
        await db.commit()

        profile_result = await db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == job.user_id)
        )
        profile = profile_result.scalar_one_or_none()
        if not profile:
            job.status = "failed"
            job.error_message = "No learner profile found"
            await db.commit()
            return

        courses_result = await db.execute(select(Course).limit(200))
        courses = courses_result.scalars().all()
        course_dicts = []
        for c in courses:
            course_dicts.append(
                {
                    "id": str(c.id),
                    "title": c.title,
                    "vark_v_score": c.vark_v_score or 0.25,
                    "vark_a_score": c.vark_a_score or 0.25,
                    "vark_r_score": c.vark_r_score or 0.25,
                    "vark_k_score": c.vark_k_score or 0.25,
                    "style_tags": c.style_tags or [],
                    "math_depth": c.math_depth or 1,
                    "hours_per_week": c.hours_per_week or 4,
                    "nsqf_level": c.nsqf_level or 0,
                    "avg_rating": c.avg_rating,
                    "review_count": c.review_count or 0,
                    "week_breakdown": c.week_breakdown,
                    "completion_rate": c.completion_rate,
                }
            )

        profile_dict = {
            "vark_v": profile.vark_v or 0.25,
            "vark_a": profile.vark_a or 0.25,
            "vark_r": profile.vark_r or 0.25,
            "vark_k": profile.vark_k or 0.25,
            "style_preferences": profile.style_preferences or [],
        }

        results = filter_and_score_courses(
            course_dicts,
            profile_dict,
            profile.hours_per_week,
            profile.math_comfort,
            profile.goal,
        )
        ranked = []
        for i, (course, report) in enumerate(results[:20]):
            ranked.append(
                {
                    "course_id": course["id"],
                    "rank": i + 1,
                    "overall_match_pct": report["overall_match_pct"],
                    "vark_alignment_pct": report["vark_alignment_pct"],
                    "style_match_pct": report["style_match_pct"],
                    "math_level": report["math_level"],
                    "math_warning_detail": report["math_warning_detail"],
                    "completion_rate_cluster": report["completion_rate_your_cluster"],
                    "collab_confidence": report["collab_confidence"],
                    "match_report": report,
                    "course": {
                        "id": course["id"],
                        "title": course.get("title", ""),
                        "description": "",
                        "provider": "",
                        "url": None,
                        "duration_hours": None,
                        "nsqf_level": course.get("nsqf_level"),
                        "nsqf_sector": None,
                        "language": "en",
                        "difficulty": course.get("math_depth", 1),
                        "style_tags": course.get("style_tags", []),
                        "math_depth": course.get("math_depth", 1),
                        "math_topics": [],
                        "vark_v_score": course.get("vark_v_score", 0.25),
                        "vark_a_score": course.get("vark_a_score", 0.25),
                        "vark_r_score": course.get("vark_r_score", 0.25),
                        "vark_k_score": course.get("vark_k_score", 0.25),
                        "week_breakdown": course.get("week_breakdown"),
                        "hours_per_week": course.get("hours_per_week"),
                        "completion_rate": course.get("completion_rate"),
                        "avg_rating": course.get("avg_rating"),
                        "review_count": course.get("review_count", 0),
                    },
                }
            )

        job.status = "ready"
        job.results = ranked
        job.completed_at = datetime.utcnow()
        await db.commit()


@celery_app.task(name="app.tasks.recommendations.rebuild_faiss_index")
def rebuild_faiss_index():
    import os

    os.makedirs("models", exist_ok=True)
    return {"status": "ok"}


def compute_recommendations_task(job_id: str):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(_run_recommendations(job_id))
    finally:
        loop.close()
