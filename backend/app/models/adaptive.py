import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Integer,
    ForeignKey,
    Enum as SAEnum,
    Float,
    SmallInteger,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.enums import GoalEnum


class CourseActivity(Base):
    __tablename__ = "course_activities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrolment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enrolments.id", ondelete="CASCADE"),
        nullable=False,
    )
    lesson_id = Column(Text, nullable=True)
    activity_type = Column(String(50), nullable=False)
    duration_seconds = Column(Integer, default=0)
    scroll_depth = Column(Float, nullable=True)
    pause_count = Column(Integer, default=0)
    seek_count = Column(Integer, default=0)
    idle_seconds = Column(Integer, default=0)
    interactions = Column(JSON, default=list)

    video_position = Column(Integer, default=0)
    video_duration = Column(Integer, default=0)
    video_ended = Column(Integer, default=0)
    video_paused_at = Column(Integer, nullable=True)
    video_events = Column(JSON, default=list)
    embed_provider = Column(String(50), nullable=True)

    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)
    is_anomaly = Column(String(20), nullable=True)
    anomaly_type = Column(String(50), nullable=True)
    anomaly_score = Column(Float, nullable=True)

    enrolment = relationship("Enrolment", back_populates="activities")
    user = relationship("User")


class UserEngagementProfile(Base):
    __tablename__ = "user_engagement_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    avg_session_duration = Column(Float, default=0.0)
    avg_completion_speed = Column(Float, default=0.0)
    avg_idle_time = Column(Float, default=0.0)
    avg_pause_frequency = Column(Float, default=0.0)
    avg_scroll_depth = Column(Float, default=0.0)
    avg_seek_frequency = Column(Float, default=0.0)
    interaction_density = Column(Float, default=0.0)

    anomaly_count = Column(SmallInteger, default=0)
    struggle_count = Column(SmallInteger, default=0)
    boredom_count = Column(SmallInteger, default=0)
    skipping_count = Column(SmallInteger, default=0)

    last_anomaly_at = Column(DateTime(timezone=True), nullable=True)
    last_updated = Column(DateTime(timezone=True), default=datetime.utcnow)

    isolation_forest_score = Column(Float, nullable=True)
    is_tracked = Column(Integer, default=0)

    user = relationship("User", back_populates="engagement_profiles")
    course = relationship("Course", back_populates="engagement_profiles")


class AdaptiveRecommendation(Base):
    __tablename__ = "adaptive_recommendations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    recommendation_type = Column(String(50), nullable=False)
    action = Column(String(100), nullable=False)
    reason = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    priority = Column(SmallInteger, default=0)

    state_before = Column(JSON, nullable=True)
    state_after = Column(JSON, nullable=True)
    reward = Column(Float, nullable=True)

    is_applied = Column(Integer, default=0)
    applied_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User")
    course = relationship("Course")


class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_text = Column(Text, nullable=False)
    question_type = Column(String(20), default="multiple_choice")
    options = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=True)
    difficulty = Column(SmallInteger, default=2)
    topic = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    course = relationship("Course", back_populates="quiz_questions")
    attempts = relationship("QuizAttempt", back_populates="question")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_id = Column(
        UUID(as_uuid=True),
        ForeignKey("quiz_questions.id", ondelete="CASCADE"),
        nullable=False,
    )
    selected_answer = Column(Text, nullable=True)
    is_correct = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, nullable=True)
    hint_used = Column(Integer, default=0)
    attempt_number = Column(SmallInteger, default=1)

    ease_factor = Column(Float, default=2.5)
    interval_days = Column(SmallInteger, default=1)
    repetitions = Column(SmallInteger, default=0)
    next_review_at = Column(DateTime(timezone=True), nullable=True)
    last_reviewed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")
    question = relationship("QuizQuestion", back_populates="attempts")


class LearningState(Base):
    __tablename__ = "learning_states"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    current_lesson = Column(Text, nullable=True)
    progress_percent = Column(Float, default=0.0)
    confidence_level = Column(Float, default=0.5)
    engagement_score = Column(Float, default=0.5)

    q_learning_state = Column(JSON, nullable=True)
    policy_version = Column(SmallInteger, default=1)

    streak_days = Column(SmallInteger, default=0)
    total_time_spent = Column(Integer, default=0)
    last_learned_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    user = relationship("User", back_populates="learning_states")
    course = relationship("Course", back_populates="learning_states")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
    )

    intervention_type = Column(String(50), nullable=False)
    trigger_event = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    action_taken = Column(Text, nullable=True)
    is_read = Column(Integer, default=0)
    effectiveness_score = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    read_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="interventions")
    course = relationship("Course", back_populates="interventions")
