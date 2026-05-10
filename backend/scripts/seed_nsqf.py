"""Seed NSQF courses from CSV into the database."""

import asyncio
import pandas as pd
from app.db.session import async_session_maker
from app.models import Course


async def seed_nsqf_courses(csv_path: str):
    df = pd.read_csv(csv_path)
    async with async_session_maker() as db:
        for _, row in df.iterrows():
            course = Course(
                title=row.get("title", ""),
                description=row.get("description", ""),
                provider=row.get("provider", "NSDC"),
                nsqf_level=int(row.get("nsqf_level", 0))
                if pd.notna(row.get("nsqf_level"))
                else None,
                nsqf_sector=row.get("nsqf_sector", ""),
                difficulty=int(row.get("difficulty", 2))
                if pd.notna(row.get("difficulty"))
                else 2,
                language="en",
                math_depth=int(row.get("math_depth", 1))
                if pd.notna(row.get("math_depth"))
                else 1,
                llm_tagged=True,
            )
            db.add(course)
        await db.commit()
        print(f"Seeded {len(df)} NSQF courses")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python seed_nsqf.py <path_to_csv>")
    else:
        asyncio.run(seed_nsqf_courses(sys.argv[1]))
