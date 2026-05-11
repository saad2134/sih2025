"""Auth service with JWT token management."""

import uuid
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import redis.asyncio as redis

from app.config import settings
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, UserResponse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(self, db: AsyncSession, redis_client: redis.Redis):
        self.db = db
        self.redis = redis_client

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    def create_access_token(self, user_id: str, expires_delta: timedelta | None = None) -> str:
        expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode = {"sub": user_id, "exp": expire, "type": "access"}
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

    def create_refresh_token(self, user_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {"sub": user_id, "exp": expire, "type": "refresh", "jti": str(uuid.uuid4())}
        token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
        return token

    async def store_refresh_token(self, user_id: str, token: str):
        await self.redis.setex(
            f"refresh:{user_id}:{token}",
            timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            "valid"
        )

    async def validate_refresh_token(self, user_id: str, token: str) -> bool:
        key = f"refresh:{user_id}:{token}"
        return await self.redis.exists(key)

    async def revoke_refresh_token(self, user_id: str, token: str):
        await self.redis.delete(f"refresh:{user_id}:{token}")

    async def register(self, data: SignupRequest) -> tuple[User, TokenResponse]:
        result = await self.db.execute(select(User).where(User.email == data.email.lower()))
        existing = result.scalar_one_or_none()
        if existing:
            raise ValueError("DUPLICATE_EMAIL")

        user = User(
            email=data.email.lower(),
            password_hash=self.hash_password(data.password),
            full_name=data.full_name,
            timezone=data.timezone or "Asia/Kolkata",
        )
        self.db.add(user)
        await self.db.flush()

        access_token = self.create_access_token(str(user.id))
        refresh_token = self.create_refresh_token(str(user.id))
        await self.store_refresh_token(str(user.id), refresh_token)

        return user, TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        result = await self.db.execute(select(User).where(User.email == data.email.lower()))
        user = result.scalar_one_or_none()
        if not user or not self.verify_password(data.password, user.password_hash):
            raise ValueError("INVALID_CREDENTIALS")

        access_token = self.create_access_token(str(user.id))
        refresh_token = self.create_refresh_token(str(user.id))
        await self.store_refresh_token(str(user.id), refresh_token)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != "refresh":
                raise ValueError("INVALID_TOKEN")
            
            user_id = payload.get("sub")
            if not await self.validate_refresh_token(user_id, refresh_token):
                raise ValueError("TOKEN_EXPIRED")

            await self.revoke_refresh_token(user_id, refresh_token)
            
            new_access = self.create_access_token(user_id)
            new_refresh = self.create_refresh_token(user_id)
            await self.store_refresh_token(user_id, new_refresh)

            return TokenResponse(
                access_token=new_access,
                refresh_token=new_refresh,
            )
        except JWTError:
            raise ValueError("INVALID_TOKEN")

    async def get_current_user(self, token: str) -> User:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if payload.get("type") != "access":
                raise ValueError("INVALID_TOKEN")
        except JWTError:
            raise ValueError("INVALID_TOKEN")

        result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = result.scalar_one_or_none()
        if not user:
            raise ValueError("USER_NOT_FOUND")
        return user

    async def logout(self, user_id: str, refresh_token: str):
        await self.revoke_refresh_token(user_id, refresh_token)