"""Standard response envelope and common schemas."""

from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, Optional, Any

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None
    sentry_id: Optional[str] = None


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response envelope."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[ErrorDetail] = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, code: str, message: str, details: Optional[dict] = None) -> "ApiResponse":
        return cls(success=False, error=ErrorDetail(code=code, message=message, details=details))


class HealthResponse(BaseModel):
    status: str
    version: str
    database: str
    redis: str
    celery: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 20
    total: Optional[int] = None

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    pages: int

    @classmethod
    def create(cls, items: list[T], total: int, page: int, limit: int) -> "PaginatedResponse[T]":
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=(total + limit - 1) // limit if limit > 0 else 0
        )


class GoalEnum(str):
    JOB = "job"
    CERTIFICATION = "certification"
    CURIOSITY = "curiosity"
    RESEARCH = "research"
    UPSKILLING = "upskilling"


class LevelEnum(str):
    NONE = "none"
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class MathLevelEnum(str):
    PASS = "PASS"
    WARN = "WARN"
    EXCLUDE = "EXCLUDE"