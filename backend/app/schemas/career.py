"""Career schemas."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SkillGap(BaseModel):
    career_target: str
    skills_required: list[str]
    skills_owned: list[str]
    skills_gained_by_course: list[str]
    gap: list[str]
    gap_percentage: float


class CareerScore(BaseModel):
    career_target: str
    skill_match_pct: float
    nsqf_alignment: bool
    level: str
    next_steps: list[str]


class MarketSkill(BaseModel):
    name: str
    demand: int
    growth: str
    salary: str
    icon: str


class MarketJobRole(BaseModel):
    title: str
    demand: str
    openings: int
    avgSalary: str
    growth: str


class MarketCompany(BaseModel):
    name: str
    hiring: int
    roles: list[str]


class CareerForecast(BaseModel):
    year: int
    webDev: int
    dataScience: int
    aiMl: int
    cloud: int


class YourPathFit(BaseModel):
    currentRole: str
    matchScore: int
    demandForecast: str
    growthRate: str
    recommendedSkills: list[str]
    jobAvailability: float


class MarketInsightsResponse(BaseModel):
    your_path_fit: YourPathFit
    skills: list[MarketSkill]
    job_roles: list[MarketJobRole]
    companies: list[MarketCompany]
    career_forecasts: list[CareerForecast]


class MilestoneDetails(BaseModel):
    skills: list[str]
    resources: list[str]
    nextSteps: str
    provider: Optional[str] = None
    level: Optional[str] = None
    salary: Optional[str] = None
    companies: Optional[list[str]] = None
    course_id: Optional[str] = None
    enrolment_id: Optional[str] = None
    current_week: Optional[int] = None
    study_mode: Optional[str] = None
    url: Optional[str] = None


class MilestoneOverrideRequest(BaseModel):
    milestone_id: int
    study_mode: str




class Milestone(BaseModel):
    id: int
    title: str
    status: str
    type: str
    description: str
    duration: str
    progress: int
    icon: str
    color: str
    bgColor: str
    details: MilestoneDetails


class CareerPath(BaseModel):
    goal: str
    duration: str
    level: str
    match: int


class CareerMapResponse(BaseModel):
    career_path: CareerPath
    milestones: list[Milestone]
    generated_at: Optional[datetime] = None
    is_stale: bool = False