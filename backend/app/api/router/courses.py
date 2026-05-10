from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from uuid import UUID
from typing import Optional, List
from app.db import get_db
from app.models import Course, Review
from app.schemas import CourseOut, ReviewOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("")
async def list_courses(
    topic: Optional[str] = None,
    difficulty: Optional[int] = None,
    style_tags: Optional[str] = Query(None),
    math_depth_max: Optional[int] = None,
    nsqf_only: Optional[bool] = False,
    provider: Optional[str] = None,
    language: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Course)
    if topic:
        query = query.where(
            or_(
                Course.title.ilike(f"%{topic}%"), Course.description.ilike(f"%{topic}%")
            )
        )
    if difficulty:
        query = query.where(Course.difficulty == difficulty)
    if math_depth_max:
        query = query.where(Course.math_depth <= math_depth_max)
    if nsqf_only:
        query = query.where(Course.nsqf_level.isnot(None), Course.nsqf_level > 0)
    if provider:
        query = query.where(Course.provider.ilike(f"%{provider}%"))
    if language:
        query = query.where(Course.language == language)
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    courses = result.scalars().all()
    return [CourseOut.model_validate(c) for c in courses]


@router.get("/{course_id}", response_model=CourseOut)
async def get_course(course_id: UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Course not found"},
        )
    return course


@router.get("/search")
async def search_courses(
    q: str = Query(min_length=1),
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(Course)
        .where(or_(Course.title.ilike(f"%{q}%"), Course.description.ilike(f"%{q}%")))
        .offset(offset)
        .limit(limit)
    )
    courses = result.scalars().all()
    return [CourseOut.model_validate(c) for c in courses]


@router.get("/{course_id}/difficulty-curve")
async def get_difficulty_curve(course_id: UUID, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(Course).where(Course.id == course_id))
    course = result.scalar_one_or_none()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Course not found"},
        )
    if not course.week_breakdown:
        return status.HTTP_204_NO_CONTENT
    return course.week_breakdown


@router.get("/{course_id}/reviews", response_model=List[ReviewOut])
async def get_reviews(
    course_id: UUID,
    vark_type: Optional[str] = Query(None),
    limit: int = Query(default=20, ge=1, le=100),
    page: int = Query(default=1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    query = select(Review).where(Review.course_id == course_id)
    if vark_type:
        query = query.where(Review.vark_type == vark_type.upper())
    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    reviews = result.scalars().all()
    return [ReviewOut.model_validate(r) for r in reviews]


@router.post(
    "/{course_id}/reviews",
    response_model=ReviewOut,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    course_id: UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from sqlalchemy import select

    course_result = await db.execute(select(Course).where(Course.id == course_id))
    if not course_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Course not found"},
        )
    from app.models import LearnerProfile

    profile_result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()
    review = Review(
        course_id=course_id,
        user_id=current_user.id,
        rating=payload.get("rating"),
        body=payload.get("body"),
        reviewer_type="user",
        vark_type=profile.dominant_vark if profile else None,
        completion_status=payload.get("completion_status"),
        what_surprised_you=payload.get("what_surprised_you"),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return ReviewOut.model_validate(review)
