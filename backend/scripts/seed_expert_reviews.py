"""
Expert review seed script - run once for initial course reviews.

Phase 1: Expert review cards (manually written, clearly labelled).
These are NOT scraped testimonials - they are team-written analyses.
"""

import asyncio
import csv
from pathlib import Path

from app.db.session import AsyncSessionLocal
from app.models.review import Review
from app.models.course import Course
from sqlalchemy import select


async def seed_expert_reviews(csv_path: str):
    """Import expert reviews for courses."""
    
    async with AsyncSessionLocal() as session:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                course_title = row.get("course_title", "").strip()
                
                result = await session.execute(
                    select(Course).where(Course.title.ilike(f"%{course_title}%"))
                )
                course = result.scalar_one_or_none()
                
                if not course:
                    print(f"Course not found: {course_title}")
                    continue
                
                review = Review(
                    course_id=course.id,
                    user_id=None,
                    rating=int(row.get("rating", 4)),
                    body=row.get("review", "").strip(),
                    completion_status="completed",
                    reviewer_type="expert",
                    vark_cluster=int(row.get("vark_cluster", 0)) if row.get("vark_cluster") else None,
                    vark_type=row.get("vark_type", "V"),
                )
                session.add(review)
        
        await session.commit()
        print(f"Imported expert reviews from {csv_path}")


if __name__ == "__main__":
    csv_file = Path(__file__).parent.parent / "data" / "expert_reviews.csv"
    if csv_file.exists():
        asyncio.run(seed_expert_reviews(str(csv_file)))
    else:
        print(f"CSV file not found: {csv_file}")
        print("Create data/expert_reviews.csv with columns:")
        print("  course_title, rating, review, vark_cluster, vark_type")