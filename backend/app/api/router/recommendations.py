from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import Optional
from app.db import get_db
from app.models import User, LearnerProfile, Course, RecommendationJob
from app.schemas import RecommendationOut, CourseOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("")
async def get_recommendations(
    limit: int = Query(default=10, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    topic: Optional[str] = None,
    show_warned: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.onboarding_done:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ONBOARDING_REQUIRED",
                "message": "Complete onboarding first",
            },
        )
    from sqlalchemy import select

    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ONBOARDING_REQUIRED",
                "message": "Complete onboarding first",
            },
        )

    latest_job_result = await db.execute(
        select(RecommendationJob)
        .where(RecommendationJob.user_id == current_user.id)
        .order_by(RecommendationJob.created_at.desc())
        .limit(1)
    )
    job = latest_job_result.scalar_one_or_none()
    if job and job.status == "ready" and job.results:
        items = job.results[offset : offset + limit]
        results = []
        for item in items:
            course_result = await db.execute(
                select(Course).where(Course.id == UUID(item["course_id"]))
            )
            course = course_result.scalar_one_or_none()
            if course:
                results.append(
                    RecommendationOut(
                        course=CourseOut.model_validate(course),
                        match_report=item["match_report"],
                        rank=item["rank"],
                    )
                )
        return results

    query = select(Course)
    if topic:
        query = query.where(Course.title.ilike(f"%{topic}%"))
    query = query.offset(offset).limit(limit)
    course_result = await db.execute(query)
    courses = course_result.scalars().all()
    return [
        RecommendationOut(
            course=CourseOut.model_validate(c),
            match_report={
                "overall_match_pct": 50,
                "recommendation_label": "Unrated",
                "warnings": [],
            },
            rank=i + 1,
        )
        for i, c in enumerate(courses)
    ]


@router.get("/{course_id}/match-report")
async def get_match_report(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not current_user.onboarding_done:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ONBOARDING_REQUIRED",
                "message": "Complete onboarding first",
            },
        )
    from sqlalchemy import select

    profile_result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    course = course_result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Course not found"},
        )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "ONBOARDING_REQUIRED",
                "message": "Complete onboarding first",
            },
        )
    from app.services.matching import compute_match_report
    from app.models import GoalEnum

    course_dict = {
        "vark_v_score": course.vark_v_score,
        "vark_a_score": course.vark_a_score,
        "vark_r_score": course.vark_r_score,
        "vark_k_score": course.vark_k_score,
        "style_tags": course.style_tags or [],
        "math_depth": course.math_depth,
        "hours_per_week": course.hours_per_week or 4,
        "nsqf_level": course.nsqf_level,
        "avg_rating": course.avg_rating,
        "review_count": course.review_count,
        "week_breakdown": course.week_breakdown,
        "completion_rate": course.completion_rate,
    }
    profile_dict = {
        "vark_v": profile.vark_v,
        "vark_a": profile.vark_a,
        "vark_r": profile.vark_r,
        "vark_k": profile.vark_k,
        "style_preferences": profile.style_preferences or [],
    }
    report = compute_match_report(
        course_dict,
        profile_dict,
        user_hours=profile.hours_per_week,
        user_comfort=profile.math_comfort,
        user_goal=profile.goal,
    )
    return report


@router.get("/compare")
async def compare_courses(
    ids: str = Query(..., description="Comma-separated UUIDs (max 4)"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.schemas import MatchReport, Warning

    id_list = [UUID(x.strip()) for x in ids.split(",") if x.strip()][:4]
    if not id_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "VALIDATION_ERROR",
                "message": "At least one course ID required",
            },
        )
    from sqlalchemy import select

    result = await db.execute(select(Course).where(Course.id.in_(id_list)))
    courses = result.scalars().all()
    return [{"course": CourseOut.model_validate(c), "id": str(c.id)} for c in courses]


@router.post("/{course_id}/enrol", status_code=status.HTTP_201_CREATED)
async def enrol_in_course(
    course_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models import Enrolment
    from sqlalchemy import select

    existing = await db.execute(
        select(Enrolment).where(
            Enrolment.user_id == current_user.id,
            Enrolment.course_id == course_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "DUPLICATE", "message": "Already enrolled"},
        )
    course_result = await db.execute(select(Course).where(Course.id == course_id))
    if not course_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Course not found"},
        )
    enrolment = Enrolment(user_id=current_user.id, course_id=course_id)
    db.add(enrolment)
    await db.commit()
    await db.refresh(enrolment)
    from app.schemas import EnrolmentOut

    return EnrolmentOut.model_validate(enrolment)
