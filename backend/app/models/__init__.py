import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    Integer,
    ForeignKey,
    Enum as SAEnum,
    Float,
    SmallInteger,
    ARRAY,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.enums import GoalEnum, LevelEnum
from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(Text, unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    full_name = Column(Text, nullable=False)
    timezone = Column(Text, default="Asia/Kolkata")
    preferred_language = Column(Text, default="en")
    onboarding_done = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    last_active_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    learner_profile = relationship(
        "LearnerProfile", back_populates="user", uselist=False
    )
    enrolments = relationship("Enrolment", back_populates="user")
    recommendation_jobs = relationship("RecommendationJob", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    engagement_profiles = relationship("UserEngagementProfile", back_populates="user")
    learning_states = relationship("LearningState", back_populates="user")
    interventions = relationship("Intervention", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    topic = Column(Text, nullable=False, index=True)
    goal = Column(SAEnum(GoalEnum), nullable=False)
    hours_per_week = Column(SmallInteger, nullable=False)
    math_comfort = Column(SmallInteger, nullable=False)
    style_preferences = Column(ARRAY(Text), default=[])
    prior_knowledge = Column(SAEnum(LevelEnum), nullable=False)
    career_target = Column(Text, nullable=True)

    vark_v = Column(Float, default=0.0)
    vark_a = Column(Float, default=0.0)
    vark_r = Column(Float, default=0.0)
    vark_k = Column(Float, default=0.0)
    dominant_vark = Column(String(1), nullable=True)
    vark_cluster = Column(SmallInteger, nullable=True, index=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="learner_profile")


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False, index=True)
    description = Column(Text, nullable=True)
    provider = Column(Text, nullable=False)
    url = Column(Text, nullable=True)
    embed_provider = Column(String(50), nullable=True)
    embed_type = Column(String(20), default="redirect")
    embed_id = Column(Text, nullable=True)
    embed_url = Column(Text, nullable=True)
    is_embeddable = Column(Boolean, default=False)
    is_hosted = Column(Boolean, default=False)
    duration_hours = Column(Float, nullable=True)
    nsqf_level = Column(SmallInteger, nullable=True, index=True)
    nsqf_sector = Column(Text, nullable=True)
    language = Column(Text, default="en")
    difficulty = Column(SmallInteger, default=2)

    style_tags = Column(ARRAY(Text), default=[], index=True)
    math_depth = Column(SmallInteger, default=1)
    math_topics = Column(ARRAY(Text), default=[])
    vark_v_score = Column(Float, default=0.25)
    vark_a_score = Column(Float, default=0.25)
    vark_r_score = Column(Float, default=0.25)
    vark_k_score = Column(Float, default=0.25)
    week_breakdown = Column(JSON, nullable=True)
    hours_per_week = Column(Float, nullable=True)

    completion_rate = Column(Float, nullable=True)
    avg_rating = Column(Float, nullable=True)
    review_count = Column(Integer, default=0)

    llm_tagged = Column(Boolean, default=False)
    last_scraped_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    enrolments = relationship("Enrolment", back_populates="course")
    reviews = relationship("Review", back_populates="course")
    recommendation_items = relationship("RecommendationItem", back_populates="course")
    engagement_profiles = relationship("UserEngagementProfile", back_populates="course")
    learning_states = relationship("LearningState", back_populates="course")
    interventions = relationship("Intervention", back_populates="course")
    quiz_questions = relationship("QuizQuestion", back_populates="course")


class Enrolment(Base):
    __tablename__ = "enrolments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    status = Column(String(20), default="active")
    progress_percent = Column(Float, default=0.0)
    completion_week = Column(SmallInteger, nullable=True)
    current_lesson_id = Column(Text, nullable=True)
    current_lesson_type = Column(String(20), nullable=True)
    current_position = Column(Integer, default=0)
    total_watch_time = Column(Integer, default=0)
    last_watched_at = Column(DateTime(timezone=True), nullable=True)
    enrolled_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="enrolments")
    course = relationship("Course", back_populates="enrolments")
    activities = relationship("CourseActivity", back_populates="enrolment")
    engagement_profile = relationship(
        "UserEngagementProfile",
        back_populates="enrolment",
        uselist=False,
    )


class RecommendationJob(Base):
    __tablename__ = "recommendation_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status = Column(String(20), default="pending")
    results = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="recommendation_jobs")
    items = relationship("RecommendationItem", back_populates="job")


class RecommendationItem(Base):
    __tablename__ = "recommendation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("recommendation_jobs.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    overall_match_pct = Column(SmallInteger, default=0)
    vark_alignment_pct = Column(SmallInteger, default=0)
    style_match_pct = Column(SmallInteger, default=0)
    math_level = Column(String(10), nullable=True)
    math_warning_detail = Column(Text, nullable=True)
    completion_rate_cluster = Column(Float, nullable=True)
    collab_confidence = Column(String(10), nullable=True)
    match_report = Column(JSON, nullable=True)
    rank = Column(SmallInteger, default=0)

    job = relationship("RecommendationJob", back_populates="items")
    course = relationship("Course", back_populates="recommendation_items")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True
    )
    rating = Column(SmallInteger, nullable=True)
    body = Column(Text, nullable=True)
    reviewer_type = Column(String(20), default="user")
    vark_type = Column(String(1), nullable=True)
    completion_status = Column(String(20), nullable=True)
    what_surprised_you = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    course = relationship("Course", back_populates="reviews")
    user = relationship("User", back_populates="reviews")
