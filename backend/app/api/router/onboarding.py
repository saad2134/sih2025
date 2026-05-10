from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db import get_db
from app.models import User, LearnerProfile, RecommendationJob
from app.schemas import (
    QuizResponse,
    OnboardingSubmit,
    OnboardingSubmitResponse,
    LearnerProfileOut,
    LearnerProfileUpdate,
)
from app.services.auth import get_current_user
from app.ml.vark_scorer import compute_vark_scores, get_dominant_vark, VARK_QUESTIONS
from app.tasks.recommendations import compute_recommendations_task
from uuid import UUID
import asyncio

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/quiz", response_model=QuizResponse)
async def get_quiz():
    return QuizResponse(questions=VARK_QUESTIONS)


@router.post(
    "/submit",
    response_model=OnboardingSubmitResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def submit_onboarding(
    payload: OnboardingSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vark_v, vark_a, vark_r, vark_k = compute_vark_scores(payload.vark_answers)
    dominant = get_dominant_vark(vark_v, vark_a, vark_r, vark_k)

    existing = await db.execute(
        __import__("sqlalchemy")
        .select(LearnerProfile)
        .where(LearnerProfile.user_id == current_user.id)
    )
    profile = existing.scalar_one_or_none()

    if profile:
        profile.topic = payload.topic
        profile.goal = payload.goal
        profile.hours_per_week = payload.hours_per_week
        profile.math_comfort = payload.math_comfort
        profile.style_preferences = payload.style_preferences
        profile.prior_knowledge = payload.prior_knowledge
        profile.career_target = payload.career_target
        profile.vark_v = vark_v
        profile.vark_a = vark_a
        profile.vark_r = vark_r
        profile.vark_k = vark_k
        profile.dominant_vark = dominant
    else:
        profile = LearnerProfile(
            user_id=current_user.id,
            topic=payload.topic,
            goal=payload.goal,
            hours_per_week=payload.hours_per_week,
            math_comfort=payload.math_comfort,
            style_preferences=payload.style_preferences,
            prior_knowledge=payload.prior_knowledge,
            career_target=payload.career_target,
            vark_v=vark_v,
            vark_a=vark_a,
            vark_r=vark_r,
            vark_k=vark_k,
            dominant_vark=dominant,
        )
        db.add(profile)

    job = RecommendationJob(user_id=current_user.id, status="pending")
    db.add(job)
    current_user.onboarding_done = True
    await db.commit()
    await db.refresh(profile)
    await db.refresh(job)

    asyncio.create_task(compute_recommendations_task(str(job.id)))

    return OnboardingSubmitResponse(job_id=job.id, profile_id=profile.id)


@router.get("/status/{job_id}")
async def get_job_status(
    job_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(RecommendationJob).where(
            RecommendationJob.id == job_id,
            RecommendationJob.user_id == current_user.id,
        )
    )
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Job not found"},
        )
    from app.schemas import JobStatusOut, RecommendationOut, Warning, WeekBreakdown

    results = None
    if job.status == "ready" and job.results:
        recs = []
        for item in job.results:
            recs.append(
                RecommendationOut(
                    course=item["course"],
                    match_report=item["match_report"],
                    rank=item["rank"],
                )
            )
        results = recs
    return JobStatusOut(
        job_id=job.id,
        status=job.status,
        results=results,
        error_message=job.error_message,
        created_at=job.created_at,
        completed_at=job.completed_at,
    )


@router.get("/profile", response_model=LearnerProfileOut)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Profile not found"},
        )
    return profile


@router.patch("/profile", response_model=LearnerProfileOut)
async def update_profile(
    payload: LearnerProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import select

    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Profile not found"},
        )
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    job = RecommendationJob(user_id=current_user.id, status="pending")
    db.add(job)
    await db.commit()
    await db.refresh(profile)
    asyncio.create_task(compute_recommendations_task(str(job.id)))
    return profile
