"""Reviews router."""

from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.models.review import Review
from app.models.course import Course
from app.schemas.reviews import ReviewSubmit, ReviewResponse
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/submit", status_code=201)
async def submit_review(
    data: ReviewSubmit,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    course = await db.get(Course, uuid.UUID(data.course_id))
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    review = Review(
        user_id=user.id,
        course_id=uuid.UUID(data.course_id),
        rating=data.rating,
        body=data.body,
        completion_status=data.completion_status,
        vark_cluster=data.vark_cluster,
        what_surprised_you=data.what_surprised_you,
        reviewer_type="user",
    )
    db.add(review)
    await db.flush()
    
    return ApiResponse.ok(ReviewResponse(
        id=str(review.id),
        course_id=str(review.course_id),
        rating=review.rating,
        body=review.body,
        reviewer_type=review.reviewer_type,
        vark_cluster=review.vark_cluster,
        vark_type=review.vark_type,
        created_at=review.created_at.isoformat(),
    ))


@router.get("/course/{course_id}")
async def get_reviews(
    course_id: str,
    vark_type: str = Query(None),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Review).where(Review.course_id == uuid.UUID(course_id))
    
    if vark_type:
        query = query.where(Review.vark_type == vark_type.upper())
    
    query = query.limit(limit)
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    return ApiResponse.ok({
        "items": [
            ReviewResponse(
                id=str(r.id),
                course_id=str(r.course_id),
                rating=r.rating,
                body=r.body,
                reviewer_type=r.reviewer_type,
                vark_cluster=r.vark_cluster,
                vark_type=r.vark_type,
                created_at=r.created_at.isoformat(),
            )
            for r in reviews
        ],
        "total": len(reviews),
    })