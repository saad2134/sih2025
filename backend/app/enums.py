import enum


class GoalEnum(str, enum.Enum):
    job = "job"
    certification = "certification"
    curiosity = "curiosity"
    research = "research"
    upskilling = "upskilling"


class LevelEnum(str, enum.Enum):
    none = "none"
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
