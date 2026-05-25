"""Courses router."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.services.course import CourseService
from app.schemas.courses import CourseListItem, CourseDetail
from app.schemas.common import ApiResponse, PaginatedResponse

router = APIRouter(prefix="/courses", tags=["courses"])


async def get_course_service(db: AsyncSession = Depends(get_db)) -> CourseService:
    return CourseService(db)


@router.get("")
async def list_courses(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    math_depth_max: Optional[int] = None,
    nsqf_only: bool = False,
    provider: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    service: CourseService = Depends(get_course_service),
):
    courses, total = await service.list_courses(
        topic=topic,
        difficulty=difficulty,
        math_depth_max=math_depth_max,
        nsqf_only=nsqf_only,
        provider=provider,
        page=page,
        limit=limit,
    )
    
    items = [
        CourseListItem(
            id=str(c.id),
            title=c.title,
            provider=c.provider,
            url=c.url,
            description=c.description,
            nsqf_level=c.nsqf_level,
            nsqf_sector=c.nsqf_sector,
            style_tags=c.style_tags,
            math_depth=c.math_depth,
            math_topics=c.math_topics,
            vark_v_score=c.vark_v_score,
            vark_a_score=c.vark_a_score,
            vark_r_score=c.vark_r_score,
            vark_k_score=c.vark_k_score,
            hours_per_week=c.hours_per_week,
            completion_rate=c.completion_rate,
            avg_rating=c.avg_rating,
            review_count=c.review_count,
            total_hours=c.total_hours,
            difficulty=c.difficulty,
            language=c.language,
            is_nsqf=c.nsqf_level > 0,
        )
        for c in courses
    ]
    
    return ApiResponse.ok(PaginatedResponse.create(items, total, page, limit))


@router.get("/{course_id}")
async def get_course(
    course_id: str,
    service: CourseService = Depends(get_course_service),
):
    course = await service.get_course(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return ApiResponse.ok(CourseDetail(
        id=str(course.id),
        title=course.title,
        provider=course.provider,
        url=course.url,
        description=course.description,
        nsqf_level=course.nsqf_level,
        nsqf_sector=course.nsqf_sector,
        style_tags=course.style_tags,
        math_depth=course.math_depth,
        math_topics=course.math_topics,
        vark_v_score=course.vark_v_score,
        vark_a_score=course.vark_a_score,
        vark_r_score=course.vark_r_score,
        vark_k_score=course.vark_k_score,
        hours_per_week=course.hours_per_week,
        completion_rate=course.completion_rate,
        avg_rating=course.avg_rating,
        review_count=course.review_count,
        total_hours=course.total_hours,
        difficulty=course.difficulty,
        language=course.language,
        week_breakdown=course.week_breakdown,
        is_nsqf=course.nsqf_level > 0,
        last_scraped_at=course.last_scraped_at.isoformat() if course.last_scraped_at else None,
    ))


@router.get("/search")
async def search_courses(
    q: str,
    limit: int = Query(20, ge=1, le=100),
    service: CourseService = Depends(get_course_service),
):
    results = await service.search_courses(q, limit)
    return ApiResponse.ok({"items": results, "total": len(results)})