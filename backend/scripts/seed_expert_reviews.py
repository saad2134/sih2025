"""Seed expert review cards for Phase 1 testimonials."""

import asyncio
from app.db.session import async_session_maker
from app.models import Review
from uuid import uuid4


EXPERT_REVIEWS = [
    {
        "course_id": "placeholder",
        "body": "An excellent course for visual learners. The diagrams and flowcharts make complex concepts accessible.",
        "rating": 5,
        "vark_type": "V",
        "reviewer_type": "expert",
    },
    {
        "course_id": "placeholder",
        "body": "Great hands-on approach. You will be writing code from week 1. Best for kinesthetic learners.",
        "rating": 5,
        "vark_type": "K",
        "reviewer_type": "expert",
    },
    {
        "course_id": "placeholder",
        "body": "Well-structured reading material and references. Perfect for reading/writing preference learners.",
        "rating": 4,
        "vark_type": "R",
        "reviewer_type": "expert",
    },
]


async def seed_expert_reviews(course_id: str):
    async with async_session_maker() as db:
        for review_data in EXPERT_REVIEWS:
            review = Review(
                course_id=course_id,
                reviewer_type="expert",
                body=review_data["body"],
                rating=review_data["rating"],
                vark_type=review_data["vark_type"],
            )
            db.add(review)
        await db.commit()
        print(f"Seeded {len(EXPERT_REVIEWS)} expert reviews for course {course_id}")


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python seed_expert_reviews.py <course_id>")
    else:
        asyncio.run(seed_expert_reviews(sys.argv[1]))
