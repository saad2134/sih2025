"""Course model with pgvector for VARK similarity."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey, ARRAY, JSON, func
from sqlalchemy.dialects.postgresql import UUID, TSVECTOR
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.types import Uuid
from typing import Optional

from app.db.base import Base


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    provider: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    nsqf_level: Mapped[int] = mapped_column(Integer, default=0)
    nsqf_sector: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    style_tags: Mapped[list] = mapped_column(ARRAY(String), default=list)
    math_depth: Mapped[int] = mapped_column(Integer, default=1)
    math_topics: Mapped[list] = mapped_column(ARRAY(String), default=list)
    
    vark_v_score: Mapped[float] = mapped_column(Float, default=0.25)
    vark_a_score: Mapped[float] = mapped_column(Float, default=0.25)
    vark_r_score: Mapped[float] = mapped_column(Float, default=0.25)
    vark_k_score: Mapped[float] = mapped_column(Float, default=0.25)
    vark_vector: Mapped[Optional[list]] = mapped_column(ARRAY(Float), nullable=True)
    
    hours_per_week: Mapped[float] = mapped_column(Float, default=0)
    total_hours: Mapped[float] = mapped_column(Float, default=0)
    completion_rate: Mapped[float] = mapped_column(Float, default=0)
    avg_rating: Mapped[float] = mapped_column(Float, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    
    difficulty: Mapped[str] = mapped_column(String(50), default="beginner")
    language: Mapped[str] = mapped_column(String(10), default="en")
    sector: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    week_breakdown: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    prerequisites: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    job_roles: Mapped[Optional[list]] = mapped_column(ARRAY(String), nullable=True)
    
    llm_tagged: Mapped[bool] = mapped_column(Boolean, default=False)
    last_scraped_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    search_vector: Mapped[Optional[dict]] = mapped_column(TSVECTOR, nullable=True)
    
    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="course")
    enrolments: Mapped[list["Enrolment"]] = relationship("Enrolment", back_populates="course")

    __table_args__ = (
        {"schema": None},
    )