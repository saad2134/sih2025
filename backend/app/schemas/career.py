"""Career schemas."""

from pydantic import BaseModel
from typing import Optional


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