"""User model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    timezone: Mapped[str] = mapped_column(String(100), default="Asia/Kolkata")
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    onboarding_done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    learner_profile: Mapped[Optional["LearnerProfile"]] = relationship("LearnerProfile", back_populates="user", uselist=False)
    recommendations: Mapped[list["RecommendationJob"]] = relationship("RecommendationJob", back_populates="user")
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")