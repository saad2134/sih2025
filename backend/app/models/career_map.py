"""Career map snapshot model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.db.base import Base


class CareerMapSnapshot(Base):
    __tablename__ = "career_map_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)

    career_target_used: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    career_path: Mapped[dict] = mapped_column(JSONB, nullable=False)
    milestones: Mapped[list] = mapped_column(JSONB, nullable=False)
    enrolment_count: Mapped[int] = mapped_column(default=0)

    is_stale: Mapped[bool] = mapped_column(Boolean, default=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MilestoneOverride(Base):
    __tablename__ = "milestone_overrides"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    milestone_id: Mapped[int] = mapped_column(Integer, nullable=False)
    study_mode: Mapped[str] = mapped_column(String(50), default="standard", server_default="standard")

    __table_args__ = (
        UniqueConstraint("user_id", "milestone_id", name="uq_user_milestone_override"),
        {"schema": None},
    )

