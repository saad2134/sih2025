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
from app.schemas.recommendations import CourseWithMatch, MatchReport, EnrolmentUpdate
from app.schemas.common import ApiResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

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
            status_code=403,
            detail={"code": "ONBOARDING_REQUIRED", "message": "Complete onboarding first"}
        )
    return str(user.id)


@router.get("")
async def get_recommendations(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=403, detail="Complete onboarding first")

    service = MatchingService(db)
    recommendations = await service.get_recommendations(profile, limit, offset)
    return ApiResponse.ok({"items": [r.model_dump() for r in recommendations], "total": len(recommendations), "limit": limit, "offset": offset})


@router.get("/{course_id}/match-report")
async def get_match_report(
    course_id: str,
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
    
    service = MatchingService(db)
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
    
    # Mark career map stale on enrolment
    from app.models.career_map import CareerMapSnapshot
    cmap_result = await db.execute(
        select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == uuid.UUID(user_id))
    )
    cmap = cmap_result.scalar_one_or_none()
    if cmap:
        cmap.is_stale = True
        
    await db.flush()
    
    return ApiResponse.ok({"enrolment_id": str(enrolment.id), "course_title": course.title})


@router.get("/enrolled")
async def get_enrolled_courses(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import Enrolment
    
    result = await db.execute(
        select(Enrolment)
        .where(Enrolment.user_id == uuid.UUID(user_id))
        .options(selectinload(Enrolment.course))
    )
    enrolments = result.scalars().all()
    
    items = []
    for e in enrolments:
        items.append({
            "enrolment_id": str(e.id),
            "course_id": str(e.course_id),
            "title": e.course.title,
            "provider": e.course.provider,
            "progress_pct": e.progress_pct,
            "current_week": e.current_week,
            "total_hours": e.course.total_hours,
            "enrolled_at": e.enrolled_at.isoformat(),
            "completed_at": e.completed_at.isoformat() if e.completed_at else None,
        })
    return ApiResponse.ok(items)


@router.patch("/enrolments/{enrolment_id}")
async def update_enrolment(
    enrolment_id: str,
    data: EnrolmentUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import Enrolment
    from datetime import datetime, timezone
    
    enrol_uuid = uuid.UUID(enrolment_id)
    enrolment = await db.get(Enrolment, enrol_uuid)
    if not enrolment:
        raise HTTPException(status_code=404, detail="Enrolment not found")
        
    if str(enrolment.user_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this enrolment")
        
    if data.progress_pct is not None:
        enrolment.progress_pct = data.progress_pct
        if data.progress_pct >= 100.0:
            enrolment.completed_at = datetime.now(timezone.utc)
        else:
            enrolment.completed_at = None
            
    if data.current_week is not None:
        enrolment.current_week = data.current_week
        
    if data.dropped is not None:
        enrolment.dropped = data.dropped
        if data.dropped:
            enrolment.dropped_at = datetime.now(timezone.utc)
        else:
            enrolment.dropped_at = None

    if data.study_mode is not None:
        enrolment.study_mode = data.study_mode
            
    # Mark career map stale on enrolment update
    from app.models.career_map import CareerMapSnapshot
    cmap_result = await db.execute(
        select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == uuid.UUID(user_id))
    )
    cmap = cmap_result.scalar_one_or_none()
    if cmap:
        cmap.is_stale = True

    await db.flush()
    return ApiResponse.ok({"status": "updated"})


@router.get("/saved")
async def get_saved_courses(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import SavedCourse
    
    profile_result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
    )
    profile = profile_result.scalar_one_or_none()
    
    result = await db.execute(
        select(SavedCourse)
        .where(SavedCourse.user_id == uuid.UUID(user_id))
        .options(selectinload(SavedCourse.course))
    )
    saved = result.scalars().all()
    
    service = MatchingService(db)
    items = []
    for s in saved:
        match_report = await service.compute_match_report(profile, s.course) if profile else None
        items.append({
            "saved_id": str(s.id),
            "id": str(s.course_id),
            "title": s.course.title,
            "provider": s.course.provider,
            "url": s.course.url,
            "description": s.course.description,
            "nsqf_level": s.course.nsqf_level,
            "nsqf_sector": s.course.nsqf_sector,
            "style_tags": s.course.style_tags or [],
            "math_depth": s.course.math_depth,
            "hours_per_week": s.course.hours_per_week,
            "completion_rate": s.course.completion_rate,
            "avg_rating": s.course.avg_rating,
            "difficulty": s.course.difficulty,
            "language": s.course.language,
            "is_nsqf": s.course.nsqf_level > 0,
            "match": match_report.overall_match_pct if match_report else 75,
            "saved_at": s.saved_at.isoformat()
        })
    return ApiResponse.ok(items)


@router.post("/saved/{course_id}")
async def save_course(
    course_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import SavedCourse
    from app.models.course import Course
    
    course_uuid = uuid.UUID(course_id)
    course = await db.get(Course, course_uuid)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
        
    existing = await db.execute(
        select(SavedCourse).where(
            SavedCourse.user_id == uuid.UUID(user_id),
            SavedCourse.course_id == course_uuid
        )
    )
    if existing.scalar_one_or_none():
        return ApiResponse.ok({"status": "already_saved"})
        
    saved = SavedCourse(
        user_id=uuid.UUID(user_id),
        course_id=course_uuid
    )
    db.add(saved)
    await db.flush()
    return ApiResponse.ok({"status": "saved", "saved_id": str(saved.id)})


@router.delete("/saved/{course_id}")
async def unsave_course(
    course_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    from app.models.recommendation import SavedCourse
    
    course_uuid = uuid.UUID(course_id)
    existing = await db.execute(
        select(SavedCourse).where(
            SavedCourse.user_id == uuid.UUID(user_id),
            SavedCourse.course_id == course_uuid
        )
    )
    saved = existing.scalar_one_or_none()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved course record not found")
        
    await db.delete(saved)
    await db.flush()
    return ApiResponse.ok({"status": "unsaved"})
