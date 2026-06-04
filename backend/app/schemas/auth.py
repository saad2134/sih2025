"""Auth schemas."""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Dict, Any


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
    subscription_tier: str = "free"
    pending_subscription_tier: Optional[str] = None
    subscription_expires_at: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(BaseModel):
    user_id: str
    access_token: str
    refresh_token: str


DEFAULT_USER_SETTINGS: Dict[str, Any] = {
    # App
    "high-contrast": False,
    "low-animations": False,
    "language": "English",
    # Privacy
    "profile-visibility": True,
    "activity-status": True,
    "data-usage": True,
    # Notifications
    "course-updates": True,
    "achievement-alerts": True,
    "email-notifications": True,
    "reminder-notifications": True,
    # Other
    "data-saver": False,
    "compact-view": False,
}


class UserSettingsRequest(BaseModel):
    settings: Dict[str, Any]


class UserSettingsResponse(BaseModel):
    settings: Dict[str, Any]


class AvatarUpdateRequest(BaseModel):
    avatar_url: str
    old_file_uuid: Optional[str] = None