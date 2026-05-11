"""Course service for CRUD operations."""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from typing import Optional

from app.models.course import Course


class CourseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_courses(
        self,
        topic: Optional[str] = None,
        difficulty: Optional[str] = None,
        style_tags: Optional[list[str]] = None,
        math_depth_max: Optional[int] = None,
        nsqf_only: bool = False,
        provider: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Course], int]:
        query = select(Course)
        
        if nsqf_only:
            query = query.where(Course.nsqf_level > 0)
        if provider:
            query = query.where(Course.provider.ilike(f"%{provider}%"))
        if math_depth_max:
            query = query.where(Course.math_depth <= math_depth_max)
        
        count_result = await self.db.execute(select(func.count()).select_from(Course))
        total = count_result.scalar()
        
        query = query.offset((page - 1) * limit).limit(limit)
        result = await self.db.execute(query)
        courses = result.scalars().all()
        
        return list(courses), total

    async def get_course(self, course_id: str) -> Optional[Course]:
        result = await self.db.execute(
            select(Course).where(Course.id == uuid.UUID(course_id))
        )
        return result.scalar_one_or_none()

    async def search_courses(self, q: str, limit: int = 20) -> list[dict]:
        result = await self.db.execute(
            select(Course)
            .where(
                or_(
                    Course.title.ilike(f"%{q}%"),
                    Course.description.ilike(f"%{q}%"),
                    Course.provider.ilike(f"%{q}%"),
                )
            )
            .limit(limit)
        )
        courses = result.scalars().all()
        return [
            {
                "id": str(c.id),
                "title": c.title,
                "provider": c.provider,
                "match_score": 0.8,
            }
            for c in courses
        ]