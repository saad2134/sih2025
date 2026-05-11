"""Auth schemas."""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    timezone: Optional[str] = "Asia/Kolkata"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    timezone: str
    preferred_language: str = "en"
    onboarding_done: bool = False
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    user_id: str
    access_token: str
    refresh_token: str