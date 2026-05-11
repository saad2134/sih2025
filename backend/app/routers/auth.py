"""Auth router."""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.schemas.auth import (
    SignupRequest, LoginRequest, TokenResponse, UserResponse, AuthResponse
)
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_auth_service(
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
) -> AuthService:
    return AuthService(db, redis_client)


def get_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    return authorization.replace("Bearer ", "")


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: SignupRequest,
    service: AuthService = Depends(get_auth_service),
):
    try:
        user, tokens = await service.register(data)
        return ApiResponse.ok(AuthResponse(
            user_id=str(user.id),
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
        ))
    except ValueError as e:
        if str(e) == "DUPLICATE_EMAIL":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail={"code": "DUPLICATE_EMAIL", "message": "Email already registered"}
            )
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
async def login(
    data: LoginRequest,
    service: AuthService = Depends(get_auth_service),
):
    try:
        tokens = await service.login(data)
        return ApiResponse.ok(tokens)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}
        )


@router.post("/refresh")
async def refresh(
    data: dict,
    service: AuthService = Depends(get_auth_service),
):
    try:
        tokens = await service.refresh_tokens(data.get("refresh_token", ""))
        return ApiResponse.ok(tokens)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_EXPIRED", "message": "Invalid or expired refresh token"}
        )


@router.post("/logout")
async def logout(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    try:
        user = await service.get_current_user(token)
        await service.logout(str(user.id), token)
        return ApiResponse.ok({"message": "Logged out"})
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/me")
async def get_me(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    try:
        user = await service.get_current_user(token)
        return ApiResponse.ok(UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            timezone=user.timezone,
            preferred_language=user.preferred_language,
            onboarding_done=user.onboarding_done,
            created_at=user.created_at.isoformat(),
        ))
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")