"""Resume schemas."""

from pydantic import BaseModel, Field, ConfigDict, model_validator
from typing import Optional, Dict, Any, Any as PydanticAny
from datetime import datetime
import uuid


class ResumeBase(BaseModel):
    title: str = "My Resume"
    basics: Dict[str, Any]
    sections: Dict[str, Any]
    cv_metadata: Dict[str, Any] = Field(..., alias="metadata")

    model_config = ConfigDict(populate_by_name=True)


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    basics: Optional[Dict[str, Any]] = None
    sections: Optional[Dict[str, Any]] = None
    cv_metadata: Optional[Dict[str, Any]] = Field(None, alias="metadata")
    is_shared: Optional[bool] = None

    model_config = ConfigDict(populate_by_name=True)


class ResumeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    basics: Dict[str, Any]
    sections: Dict[str, Any]
    cv_metadata: Dict[str, Any] = Field(..., alias="metadata")
    is_shared: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    @model_validator(mode="before")
    @classmethod
    def resolve_metadata_collision(cls, data: PydanticAny) -> PydanticAny:
        if hasattr(data, "__table__"):  # check if it's a SQLAlchemy model
            return {
                "id": getattr(data, "id"),
                "user_id": getattr(data, "user_id"),
                "title": getattr(data, "title"),
                "basics": getattr(data, "basics"),
                "sections": getattr(data, "sections"),
                "metadata": getattr(data, "cv_metadata"),  # map cv_metadata to alias
                "is_shared": getattr(data, "is_shared"),
                "created_at": getattr(data, "created_at"),
                "updated_at": getattr(data, "updated_at"),
            }
        return data

