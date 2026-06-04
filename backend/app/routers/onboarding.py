"""Onboarding router."""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.onboarding import OnboardingService
from app.services.auth import AuthService
from app.db.redis import get_redis
import redis.asyncio as redis
from app.schemas.onboarding import (
    QuizResponse, OnboardingSubmit, OnboardingStatusResponse, LearnerProfile
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


async def get_onboarding_service(db: AsyncSession = Depends(get_db)) -> OnboardingService:
    return OnboardingService(db)


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
    return str(user.id)


@router.get("/quiz")
async def get_quiz(service: OnboardingService = Depends(get_onboarding_service)):
    quiz = await service.get_quiz()
    return ApiResponse.ok(quiz)


@router.post("/submit", status_code=status.HTTP_202_ACCEPTED)
async def submit_onboarding(
    data: OnboardingSubmit,
    service: OnboardingService = Depends(get_onboarding_service),
    user_id: str = Depends(get_current_user_id),
):
    try:
        job_id, profile_id = await service.submit_onboarding(user_id, data)
        return ApiResponse.ok({"job_id": job_id, "profile_id": profile_id})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status/{job_id}")
async def get_status(
    job_id: str,
    service: OnboardingService = Depends(get_onboarding_service),
):
    status_data = await service.get_job_status(job_id)
    return ApiResponse.ok(status_data)


@router.get("/profile")
async def get_profile(
    service: OnboardingService = Depends(get_onboarding_service),
    user_id: str = Depends(get_current_user_id),
):
    profile = await service.get_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ApiResponse.ok(profile)


@router.patch("/profile")
async def update_profile(
    data: dict,
    service: OnboardingService = Depends(get_onboarding_service),
    user_id: str = Depends(get_current_user_id),
):
    try:
        profile, job_id = await service.update_profile(user_id, data)
        return ApiResponse.ok({"profile": profile, "job_id": job_id})
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))