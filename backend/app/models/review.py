"""Review model."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from typing import Optional

from app.db.base import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    completion_status: Mapped[str] = mapped_column(String(50), nullable=False)
    vark_cluster: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vark_type: Mapped[Optional[str]] = mapped_column(String(1), nullable=True)
    what_surprised_you: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewer_type: Mapped[str] = mapped_column(String(20), default="user")
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship("User", back_populates="reviews")
    course: Mapped["Course"] = relationship("Course", back_populates="reviews")