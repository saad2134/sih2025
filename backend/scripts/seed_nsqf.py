"""
NSQF course seed script - run once before launch.

Source: NCVET portal PDFs, manually converted to CSV.
CSV columns: title, provider, level (1-8), sector, duration_hours,
             description, prerequisites, job_roles[]
"""

import asyncio
import csv
import uuid
from pathlib import Path

from app.db.session import AsyncSessionLocal
from app.models.course import Course


async def seed_nsqf_courses(csv_path: str):
    """Import NSQF courses from CSV into database."""
    
    async with AsyncSessionLocal() as session:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                course = Course(
                    title=row.get("title", "").strip(),
                    provider=row.get("provider", "NCVET").strip(),
                    url=row.get("url", "").strip() or f"https://nsqf.gov.in/course/{uuid.uuid4().hex[:8]}",
                    description=row.get("description", "").strip(),
                    nsqf_level=int(row.get("level", 0)) or 0,
                    nsqf_sector=row.get("sector", "").strip(),
                    total_hours=float(row.get("duration_hours", 0)) or 0,
                    prerequisites=[p.strip() for p in row.get("prerequisites", "").split(",") if p.strip()],
                    job_roles=[r.strip() for r in row.get("job_roles", "").split(",") if r.strip()],
                    difficulty="beginner" if int(row.get("level", 1)) <= 3 else "intermediate" if int(row.get("level", 1)) <= 5 else "advanced",
                    llm_tagged=False,
                )
                session.add(course)
        
        await session.commit()
        print(f"Imported NSQF courses from {csv_path}")


if __name__ == "__main__":
    csv_file = Path(__file__).parent.parent / "data" / "nsqf_courses.csv"
    if csv_file.exists():
        asyncio.run(seed_nsqf_courses(str(csv_file)))
    else:
        print(f"CSV file not found: {csv_file}")
        print("Create data/nsqf_courses.csv with columns:")
        print("  title, provider, level, sector, duration_hours, description, prerequisites, job_roles")