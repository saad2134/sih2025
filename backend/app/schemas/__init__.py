from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime
from app.enums import GoalEnum, LevelEnum


class ErrorDetail(BaseModel):
    field: Optional[str] = None
    message: str
    code: str


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail


class SuccessResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    timezone: Optional[str] = "Asia/Kolkata"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    full_name: str
    timezone: str
    preferred_language: str
    onboarding_done: bool
    created_at: datetime
    last_active_at: datetime


class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class AuthResponse(BaseModel):
    user_id: UUID
    access_token: str
    refresh_token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class QuizQuestionOption(BaseModel):
    id: str
    label: str
    vark_dim: Optional[str] = None


class QuizQuestion(BaseModel):
    id: str
    text: str
    options: List[QuizQuestionOption]


class QuizResponse(BaseModel):
    questions: List[QuizQuestion]


class OnboardingSubmit(BaseModel):
    vark_answers: List[dict] = Field(default_factory=list)
    topic: str = Field(min_length=1)
    goal: GoalEnum
    hours_per_week: int = Field(ge=1, le=40)
    math_comfort: int = Field(ge=1, le=5)
    style_preferences: List[str] = Field(default_factory=list)
    prior_knowledge: LevelEnum
    career_target: Optional[str] = None
    language: Optional[str] = "en"


class LearnerProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    topic: str
    goal: GoalEnum
    hours_per_week: int
    math_comfort: int
    style_preferences: List[str]
    prior_knowledge: LevelEnum
    career_target: Optional[str]
    vark_v: float
    vark_a: float
    vark_r: float
    vark_k: float
    dominant_vark: Optional[str]
    vark_cluster: Optional[int]
    created_at: datetime


class LearnerProfileUpdate(BaseModel):
    topic: Optional[str] = None
    goal: Optional[GoalEnum] = None
    hours_per_week: Optional[int] = Field(default=None, ge=1, le=40)
    math_comfort: Optional[int] = Field(default=None, ge=1, le=5)
    style_preferences: Optional[List[str]] = None
    prior_knowledge: Optional[LevelEnum] = None
    career_target: Optional[str] = None
    language: Optional[str] = None


class Warning(BaseModel):
    type: str
    severity: str
    message: str


class WeekBreakdown(BaseModel):
    week: int
    topics: List[str]
    difficulty_score: int


class MatchReport(BaseModel):
    overall_match_pct: int
    vark_alignment_pct: int
    style_match_pct: int
    time_fit: str
    nsqf_match: bool
    math_level: str
    math_warning_detail: Optional[str]
    math_topics_ahead: List[str]
    completion_rate_your_cluster: Optional[float]
    completion_rate_global: Optional[float]
    collab_confidence: Optional[str]
    week_breakdown: Optional[List[WeekBreakdown]]
    recommendation_label: str
    warnings: List[Warning]
    why_this_ranking: str


class CourseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    description: Optional[str]
    provider: str
    url: Optional[str]
    duration_hours: Optional[float]
    nsqf_level: Optional[int]
    nsqf_sector: Optional[str]
    language: str
    difficulty: int
    style_tags: List[str]
    math_depth: int
    math_topics: List[str]
    vark_v_score: float
    vark_a_score: float
    vark_r_score: float
    vark_k_score: float
    week_breakdown: Optional[Any]
    hours_per_week: Optional[float]
    completion_rate: Optional[float]
    avg_rating: Optional[float]
    review_count: int
    created_at: datetime


class RecommendationItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    course_id: UUID
    overall_match_pct: int
    vark_alignment_pct: int
    style_match_pct: int
    math_level: str
    math_warning_detail: Optional[str]
    completion_rate_cluster: Optional[float]
    collab_confidence: Optional[str]
    rank: int


class RecommendationOut(BaseModel):
    course: CourseOut
    match_report: MatchReport
    rank: int


class JobStatusOut(BaseModel):
    job_id: UUID
    status: str
    results: Optional[List[RecommendationOut]]
    error_message: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


class OnboardingSubmitResponse(BaseModel):
    job_id: UUID
    profile_id: UUID


class EnrolmentCreate(BaseModel):
    course_id: UUID


class EnrolmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    course_id: UUID
    status: str
    progress_percent: float
    completion_week: Optional[int]
    enrolled_at: datetime
    completed_at: Optional[datetime]


class ReviewCreate(BaseModel):
    course_id: UUID
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    body: Optional[str] = None
    completion_status: Optional[str] = None
    what_surprised_you: Optional[str] = None


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    course_id: UUID
    user_id: Optional[UUID]
    rating: Optional[int]
    body: Optional[str]
    reviewer_type: str
    vark_type: Optional[str]
    completion_status: Optional[str]
    created_at: datetime


class CourseFilter(BaseModel):
    topic: Optional[str] = None
    difficulty: Optional[int] = None
    style_tags: Optional[List[str]] = None
    math_depth_max: Optional[int] = None
    nsqf_only: Optional[bool] = False
    provider: Optional[str] = None
    language: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    database: str
    redis: str
    environment: str
