"""Learner profile and onboarding models."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Enum, ARRAY, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY as PG_ARRAY
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from app.db.base import Base


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    vark_v: Mapped[float] = mapped_column(Float, default=0.0)
    vark_a: Mapped[float] = mapped_column(Float, default=0.0)
    vark_r: Mapped[float] = mapped_column(Float, default=0.0)
    vark_k: Mapped[float] = mapped_column(Float, default=0.0)
    dominant_vark: Mapped[Optional[str]] = mapped_column(String(1), nullable=True)
    vark_cluster: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    goal: Mapped[str] = mapped_column(String(50), nullable=False)
    hours_per_week: Mapped[int] = mapped_column(Integer, nullable=False)
    math_comfort: Mapped[int] = mapped_column(Integer, default=3)
    style_preferences: Mapped[list] = mapped_column(ARRAY(String), default=list)
    prior_knowledge: Mapped[str] = mapped_column(String(50), default="none")
    career_target: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="en")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship("User", back_populates="learner_profile")
    recommendation_jobs: Mapped[list["RecommendationJob"]] = relationship("RecommendationJob", back_populates="learner_profile")


class RecommendationJob(Base):
    __tablename__ = "recommendation_jobs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    learner_profile_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False)
    
    status: Mapped[str] = mapped_column(String(20), default="pending")
    results: Mapped[Optional[list]] = mapped_column(PG_ARRAY(UUID(as_uuid=True)), nullable=True)
    error: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="recommendations")
    learner_profile: Mapped["LearnerProfile"] = relationship("LearnerProfile", back_populates="recommendation_jobs")