"""Auth router."""

from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.db.session import get_db
from app.db.redis import get_redis
import redis.asyncio as redis
from app.services.auth import AuthService
from app.schemas.auth import (
    SignupRequest, LoginRequest, TokenResponse, UserResponse, AuthResponse,
    UserSettingsRequest, UserSettingsResponse, DEFAULT_USER_SETTINGS,
    AvatarUpdateRequest
)
from app.schemas.common import ApiResponse
from app.services.uploadcare import delete_uploadcare_file
from app.config import settings

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
    except ValueError as e:
        err_msg = str(e)
        if err_msg == "USER_NOT_FOUND":
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"code": "USER_NOT_FOUND", "message": "User does not exist"}
            )
        elif err_msg == "INVALID_PASSWORD":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"code": "INVALID_PASSWORD", "message": "Incorrect password"}
            )
        else:
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
        await service.update_user_activity(user)
        return ApiResponse.ok(UserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            timezone=user.timezone,
            preferred_language=user.preferred_language,
            onboarding_done=user.onboarding_done,
            created_at=user.created_at.isoformat(),
            subscription_tier=user.subscription_tier,
            pending_subscription_tier=user.pending_subscription_tier,
            subscription_expires_at=user.subscription_expires_at.isoformat() if user.subscription_expires_at else None,
            avatar_url=user.avatar_url,
        ))
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/stats")
async def get_stats(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    """Return real-time user stats: rank, streak, points, level, total_users."""
    try:
        user = await service.get_current_user(token)
        stats = await service.get_user_stats(user)
        return ApiResponse.ok(stats)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/leaderboard")
async def get_leaderboard(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    """Return scaled leaderboard data for weekly, monthly, and all_time timeframes."""
    try:
        user = await service.get_current_user(token)
        leaderboard = await service.get_leaderboard(user)
        return ApiResponse.ok(leaderboard)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/settings")
async def get_settings(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    """Return the current user's persisted settings, merged with defaults."""
    try:
        user = await service.get_current_user(token)
        merged = {**DEFAULT_USER_SETTINGS, **(user.user_settings or {})}
        return ApiResponse.ok(UserSettingsResponse(settings=merged))
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.put("/settings")
async def update_settings(
    data: UserSettingsRequest,
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
):
    """Persist the current user's settings to the database."""
    try:
        user = await service.get_current_user(token)
        # Merge new values over existing, so partial updates work
        existing = user.user_settings or {}
        merged = {**existing, **data.settings}
        user.user_settings = merged
        await db.commit()
        await db.refresh(user)
        return ApiResponse.ok(UserSettingsResponse(settings=merged))
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.put("/avatar")
async def update_avatar(
    data: AvatarUpdateRequest,
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
    db: AsyncSession = Depends(get_db),
):
    """Update the user's avatar URL; delete the old Uploadcare file if provided."""
    try:
        user = await service.get_current_user(token)
        # Delete the old file from Uploadcare if a UUID is provided
        if data.old_file_uuid:
            await delete_uploadcare_file(data.old_file_uuid)
        user.avatar_url = data.avatar_url
        await db.commit()
        await db.refresh(user)
        return ApiResponse.ok({"avatar_url": user.avatar_url})
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/upload-signature")
async def get_upload_signature(
    service: AuthService = Depends(get_auth_service),
    token: str = Depends(get_token),
):
    """Generate a signature and expiration timestamp for secure Uploadcare upload."""
    try:
        user = await service.get_current_user(token)
        import time
        import hmac
        import hashlib

        secret_key = settings.UPLOADCARE_SECRET_KEY
        if not secret_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Uploadcare secret key not configured"
            )

        expire = int(time.time()) + 1800  # Signature valid for 30 minutes
        signature = hmac.new(
            secret_key.encode("utf-8"),
            str(expire).encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return ApiResponse.ok({
            "signature": signature,
            "expire": expire
        })
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid token")