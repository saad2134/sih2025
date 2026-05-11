"""Review schemas."""

from pydantic import BaseModel
from typing import Optional


class ReviewSubmit(BaseModel):
    course_id: str
    rating: int
    body: str
    completion_status: str
    vark_cluster: Optional[int] = None
    what_surprised_you: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    course_id: str
    rating: int
    body: str
    reviewer_type: str
    vark_cluster: Optional[int] = None
    vark_type: Optional[str] = None
    created_at: str