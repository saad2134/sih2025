"""Course schemas."""

from pydantic import BaseModel
from typing import Optional


class CourseBase(BaseModel):
    id: str
    title: str
    provider: str
    url: str
    description: Optional[str] = None
    nsqf_level: int = 0
    nsqf_sector: Optional[str] = None
    style_tags: list[str] = []
    math_depth: int = 1
    math_topics: list[str] = []
    vark_v_score: float = 0.25
    vark_a_score: float = 0.25
    vark_r_score: float = 0.25
    vark_k_score: float = 0.25
    hours_per_week: float = 0
    completion_rate: float = 0
    avg_rating: float = 0
    review_count: int = 0
    total_hours: float = 0
    difficulty: str = "beginner"
    language: str = "en"


class CourseListItem(CourseBase):
    is_nsqf: bool = False
    match_pct: Optional[int] = None


class CourseDetail(CourseBase):
    week_breakdown: Optional[list[dict]] = None
    is_nsqf: bool = False
    last_scraped_at: Optional[str] = None


class DifficultyCurve(BaseModel):
    weeks: list[dict]


class CourseSearch(BaseModel):
    id: str
    title: str
    provider: str
    match_score: float