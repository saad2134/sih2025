from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db import get_db
from app.models import User
from app.schemas import (
    UserCreate,
    UserLogin,
    AuthResponse,
    AuthTokens,
    UserOut,
    RefreshRequest,
)
from app.services.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.db.redis import get_redis
from fastapi import status

router = APIRouter(prefix="/auth", tags=["auth"])


async def get_current_user(
    authorization: str = Header(None), db: AsyncSession = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid authorization header"},
        )
    token = authorization.replace("Bearer ", "")
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid token"},
        )
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Not an access token"},
        )
    try:
        user_id = UUID(payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid token"},
        )
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NOT_FOUND", "message": "User not found"},
        )
    return user


@router.post(
    "/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED
)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": "DUPLICATE_EMAIL", "message": "Email already registered"},
        )
    hashed = get_password_hash(payload.password)
    user = User(
        email=payload.email.lower(),
        password_hash=hashed,
        full_name=payload.full_name,
        timezone=payload.timezone or "Asia/Kolkata",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    redis = await get_redis()
    await redis.setex(f"refresh:{user.id}", 7 * 24 * 3600, refresh_token)
    return AuthResponse(
        user_id=user.id, access_token=access_token, refresh_token=refresh_token
    )


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.email == payload.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
            },
        )
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    redis = await get_redis()
    await redis.setex(f"refresh:{user.id}", 7 * 24 * 3600, refresh_token)
    return AuthResponse(
        user_id=user.id, access_token=access_token, refresh_token=refresh_token
    )


@router.post("/refresh", response_model=AuthTokens)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload_dec = decode_token(payload.refresh_token)
    if not payload_dec or payload_dec.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid refresh token"},
        )
    try:
        user_id = UUID(payload_dec["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid token"},
        )
    redis = await get_redis()
    stored_token = await redis.get(f"refresh:{user_id}")
    if stored_token != payload.refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Token revoked"},
        )
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "NOT_FOUND", "message": "User not found"},
        )
    access_token = create_access_token(user.id)
    new_refresh = create_refresh_token(user.id)
    await redis.setex(f"refresh:{user.id}", 7 * 24 * 3600, new_refresh)
    return AuthTokens(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    redis = await get_redis()
    await redis.delete(f"refresh:{current_user.id}")
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
