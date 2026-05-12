"""Career router."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.schemas.career import SkillGap, CareerScore
from app.schemas.common import ApiResponse
from sqlalchemy import select
import uuid
from app.models.onboarding import LearnerProfile

router = APIRouter(prefix="/career", tags=["career"])


@router.get("/skill-gap")
async def get_skill_gap(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile or not profile.career_target:
        return ApiResponse.ok(SkillGap(
            career_target="Not set",
            skills_required=[],
            skills_owned=[],
            skills_gained_by_course=[],
            gap=[],
            gap_percentage=0.0,
        ))
    
    required = ["python", "machine_learning", "data_science", "statistics", "sql", "deep_learning"]
    owned = ["python", "sql"]
    
    return ApiResponse.ok(SkillGap(
        career_target=profile.career_target,
        skills_required=required,
        skills_owned=owned,
        skills_gained_by_course=[],
        gap=[s for s in required if s not in owned],
        gap_percentage=round(len(owned) / len(required) * 100, 1),
    ))


@router.get("/score")
async def get_career_score(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)
    
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()
    
    if not profile:
        raise HTTPException(status_code=403, detail="Complete onboarding first")
    
    skill_match = 45.0
    nsqf_alignment = profile.goal == "certification"
    
    return ApiResponse.ok(CareerScore(
        career_target=profile.career_target or "Not set",
        skill_match_pct=skill_match,
        nsqf_alignment=nsqf_alignment,
        level=f"NSQF Level {profile.topic[:2] if profile.topic else '4'}",
        next_steps=[
            "Complete foundational courses",
            "Build portfolio projects",
            "Apply for internships",
        ],
    ))