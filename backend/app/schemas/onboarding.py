"""Onboarding schemas."""

from pydantic import BaseModel
from typing import Optional


class QuizOption(BaseModel):
    id: str
    label: str
    vark_dim: str


class QuizQuestion(BaseModel):
    id: int
    text: str
    options: list[QuizOption]


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


class VarkAnswer(BaseModel):
    question_id: int
    option_id: str


class OnboardingSubmit(BaseModel):
    vark_answers: list[VarkAnswer]
    topic: str
    goal: str
    hours_per_week: int
    math_comfort: int
    style_preferences: list[str]
    prior_knowledge: str
    career_target: Optional[str] = None
    language: Optional[str] = "en"


class OnboardingStatusResponse(BaseModel):
    job_id: str
    status: str
    data: Optional[list[dict]] = None
    error: Optional[str] = None


class VarkScores(BaseModel):
    v: float
    a: float
    r: float
    k: float
    dominant: str


class LearnerProfile(BaseModel):
    id: str
    user_id: str
    vark_scores: VarkScores
    topic: str
    goal: str
    hours_per_week: int
    math_comfort: int
    style_preferences: list[str]
    prior_knowledge: str
    career_target: Optional[str]
    vark_cluster: Optional[int]
    created_at: str