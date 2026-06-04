"""Recommendation schemas."""

from pydantic import BaseModel
from typing import Optional


class WarningItem(BaseModel):
    type: str
    severity: str
    message: str


class MatchReport(BaseModel):
    overall_match_pct: int
    vark_alignment_pct: int
    style_match_pct: int
    time_fit: str
    nsqf_match: bool
    math_level: str
    math_warning_detail: Optional[str] = None
    math_topics_ahead: list[str] = []
    completion_rate_your_cluster: Optional[float] = None
    completion_rate_global: float
    collab_confidence: str
    week_breakdown: Optional[list[dict]] = None
    recommendation_label: str
    warnings: list[WarningItem] = []
    why_this_ranking: str


class CourseWithMatch(BaseModel):
    id: str
    title: str
    provider: str
    url: str
    description: Optional[str] = None
    nsqf_level: int = 0
    nsqf_sector: Optional[str] = None
    style_tags: list[str] = []
    math_depth: int = 1
    hours_per_week: float = 0
    total_hours: float = 0
    duration_months: int = 2
    completion_rate: float = 0
    avg_rating: float = 0
    difficulty: str = "beginner"
    language: str = "en"
    is_nsqf: bool = False
    match_report: MatchReport


class RecommendationListItem(BaseModel):
    course: CourseWithMatch
    rank: int


class CompareCourse(BaseModel):
    id: str
    title: str
    provider: str
    math_depth: int
    teaching_style: str
    vark_match: int
    completion_rate: float
    is_nsqf: bool
    hours_per_week: float
    avg_rating: float
    recommendation_label: str
    match_report: MatchReport


class CompareResponse(BaseModel):
    courses: list[CompareCourse]


class EnrolmentUpdate(BaseModel):
    progress_pct: Optional[float] = None
    current_week: Optional[int] = None
    dropped: Optional[bool] = None
    study_mode: Optional[str] = None