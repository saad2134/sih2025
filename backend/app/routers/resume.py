"""Resume router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import uuid
from sqlalchemy import select

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.routers.auth import get_auth_service, get_token
from app.schemas.common import ApiResponse
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse
from app.models.resume import Resume

router = APIRouter(prefix="/resumes", tags=["resumes"])


@router.get("", response_model=ApiResponse[List[ResumeResponse]])
async def list_resumes(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    token: str = Depends(get_token),
    service: AuthService = Depends(get_auth_service),
):
    """List all resumes belonging to the authenticated user."""
    try:
        user = await service.get_current_user(token)
        result = await db.execute(
            select(Resume).where(Resume.user_id == user.id).order_by(Resume.updated_at.desc())
        )
        resumes = result.scalars().all()
        return ApiResponse.ok(resumes)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.post("", response_model=ApiResponse[ResumeResponse])
async def create_resume(
    data: ResumeCreate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    token: str = Depends(get_token),
    service: AuthService = Depends(get_auth_service),
):
    """Create a new resume for the authenticated user."""
    try:
        user = await service.get_current_user(token)
        resume = Resume(
            user_id=user.id,
            title=data.title,
            basics=data.basics,
            sections=data.sections,
            cv_metadata=data.cv_metadata,
        )
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        return ApiResponse.ok(resume)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.get("/{resume_id}", response_model=ApiResponse[ResumeResponse])
async def get_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    token: str = Depends(get_token),
    service: AuthService = Depends(get_auth_service),
):
    """Get a specific resume owned by the authenticated user."""
    try:
        user = await service.get_current_user(token)
        result = await db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
        )
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        return ApiResponse.ok(resume)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.put("/{resume_id}", response_model=ApiResponse[ResumeResponse])
async def update_resume(
    resume_id: uuid.UUID,
    data: ResumeUpdate,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    token: str = Depends(get_token),
    service: AuthService = Depends(get_auth_service),
):
    """Update a specific resume owned by the authenticated user."""
    try:
        user = await service.get_current_user(token)
        result = await db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
        )
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

        # Update fields if provided
        if data.title is not None:
            resume.title = data.title
        if data.basics is not None:
            resume.basics = data.basics
        if data.sections is not None:
            resume.sections = data.sections
        if data.cv_metadata is not None:
            resume.cv_metadata = data.cv_metadata
        if data.is_shared is not None:
            resume.is_shared = data.is_shared

        await db.commit()
        await db.refresh(resume)
        return ApiResponse.ok(resume)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    token: str = Depends(get_token),
    service: AuthService = Depends(get_auth_service),
):
    """Delete a specific resume owned by the authenticated user."""
    try:
        user = await service.get_current_user(token)
        result = await db.execute(
            select(Resume).where(Resume.id == resume_id, Resume.user_id == user.id)
        )
        resume = result.scalar_one_or_none()
        if not resume:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")

        await db.delete(resume)
        await db.commit()
        return ApiResponse.ok({"message": "Resume deleted successfully"})
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@router.get("/shared/{resume_id}", response_model=ApiResponse[ResumeResponse])
async def get_shared_resume(
    resume_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Public retrieve of a shared resume. No token required."""
    result = await db.execute(
        select(Resume).where(Resume.id == resume_id)
    )
    resume = result.scalar_one_or_none()
    if not resume or not resume.is_shared:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This resume is not publicly shared or does not exist"
        )
    return ApiResponse.ok(resume)
