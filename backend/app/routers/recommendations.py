"""Recommendations router."""

from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.services.onboarding import OnboardingService
from app.ml.matching import MatchingService
from app.models.onboarding import LearnerProfile, RecommendationJob
from app.schemas.recommendations import CourseWithMatch, MatchReport
from app.schemas.common import ApiResponse
from sqlalchemy import select

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


async def get_current_user_id(
    authorization: str = Header(None),
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization")
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    if not user.onboarding_done:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"code": "ONBOARDING_REQUIRED", "message": "Complete onboarding first"}
        )
    return str(user.id)


@router.get("")
async def get_recommendations(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: MatchingService = Depends(),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=403, detail="Complete onboarding first")

    recommendations = await service.get_recommendations(profile, limit, offset)
    return ApiResponse.ok({"items": [r.model_dump() for r in recommendations], "total": len(recommendations), "limit": limit, "offset": offset})


@router.get("/{course_id}/match-report")
async def get_match_report(
    course_id: str,
    service: MatchingService = Depends(),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.course import Course
    
    profile_result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
    )
    profile = profile_result.scalar_one_or_none()
    
    course_result = await db.execute(
        select(Course).where(Course.id == uuid.UUID(course_id))
    )
    course = course_result.scalar_one_or_none()
    
    if not profile or not course:
        raise HTTPException(status_code=404, detail="Not found")
    
    report = await service.compute_match_report(profile, course)
    return ApiResponse.ok(report)


@router.post("/{course_id}/enrol")
async def enrol(
    course_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import Enrolment
    from app.models.course import Course
    
    course = await db.get(Course, uuid.UUID(course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    enrolment = Enrolment(
        user_id=uuid.UUID(user_id),
        course_id=uuid.UUID(course_id),
    )
    db.add(enrolment)
    await db.flush()
    
    return ApiResponse.ok({"enrolment_id": str(enrolment.id), "course_title": course.title})