"""Onboarding service with VARK scoring."""

import uuid
import numpy as np
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.models.onboarding import LearnerProfile, RecommendationJob
from app.schemas.onboarding import (
    QuizResponse, QuizQuestion, QuizOption, VarkAnswer, OnboardingSubmit, LearnerProfile as LearnerProfileSchema, VarkScores
)
from app.ml.vark_scorer import VARKScorer
from app.tasks.recommendations import compute_recommendations_task


VARK_QUIZ = [
    QuizQuestion(id=1, text="I learn best when content is presented as:", options=[
        QuizOption(id="1a", label="Diagrams, charts, and visual maps", vark_dim="V"),
        QuizOption(id="1r", label="Written explanations and text", vark_dim="R"),
        QuizOption(id="1a2", label="Verbal lectures and discussions", vark_dim="A"),
        QuizOption(id="1k", label="Hands-on experiments and practice", vark_dim="K"),
    ]),
    QuizQuestion(id=2, text="When studying a new topic, I prefer to:", options=[
        QuizOption(id="2a", label="Watch video tutorials first", vark_dim="V"),
        QuizOption(id="2r", label="Read the textbook or articles", vark_dim="R"),
        QuizOption(id="2a2", label="Listen to podcasts or audio explanations", vark_dim="A"),
        QuizOption(id="2k", label="Try it out and learn by doing", vark_dim="K"),
    ]),
    QuizQuestion(id=3, text="In a group study session, I typically:", options=[
        QuizOption(id="3a", label="Draw diagrams on the whiteboard", vark_dim="V"),
        QuizOption(id="3r", label="Summarize key points in writing", vark_dim="R"),
        QuizOption(id="3a2", label="Lead discussions and explain concepts", vark_dim="A"),
        QuizOption(id="3k", label="Work on practical exercises", vark_dim="K"),
    ]),
    QuizQuestion(id=4, text="When solving a problem, I find it helpful to:", options=[
        QuizOption(id="4a", label="Visualize the solution as a diagram", vark_dim="V"),
        QuizOption(id="4r", label="Write out step-by-step logic", vark_dim="R"),
        QuizOption(id="4a2", label="Talk through the problem aloud", vark_dim="A"),
        QuizOption(id="4k", label="Try different approaches hands-on", vark_dim="K"),
    ]),
    QuizQuestion(id=5, text="My study space usually has:", options=[
        QuizOption(id="5a", label="Visual organizers, color-coded notes", vark_dim="V"),
        QuizOption(id="5r", label="Books, articles, written materials", vark_dim="R"),
        QuizOption(id="5a2", label="Audio resources playing in background", vark_dim="A"),
        QuizOption(id="5k", label="Laptop, tools, or equipment to use", vark_dim="K"),
    ]),
    QuizQuestion(id=6, text="When remembering information, I:", options=[
        QuizOption(id="6a", label="Remember images and visual details", vark_dim="V"),
        QuizOption(id="6r", label="Remember what I read or wrote", vark_dim="R"),
        QuizOption(id="6a2", label="Remember conversations about it", vark_dim="A"),
        QuizOption(id="6k", label="Remember doing it myself", vark_dim="K"),
    ]),
    QuizQuestion(id=7, text="I find online courses most helpful when they include:", options=[
        QuizOption(id="7a", label="Infographics, slides, and animations", vark_dim="V"),
        QuizOption(id="7r", label="Transcripts, PDFs, and reading material", vark_dim="R"),
        QuizOption(id="7a2", label="Live Q&A sessions and discussions", vark_dim="A"),
        QuizOption(id="7k", label="Coding exercises and projects", vark_dim="K"),
    ]),
    QuizQuestion(id=8, text="For exam preparation, I would:", options=[
        QuizOption(id="8a", label="Create mind maps and visual summaries", vark_dim="V"),
        QuizOption(id="8r", label="Write practice answers and notes", vark_dim="R"),
        QuizOption(id="8a2", label="Form study groups to discuss topics", vark_dim="A"),
        QuizOption(id="8k", label="Do practice problems and past papers", vark_dim="K"),
    ]),
]


class OnboardingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scorer = VARKScorer()

    async def get_quiz(self) -> QuizResponse:
        return QuizResponse(questions=VARK_QUIZ)

    async def submit_onboarding(self, user_id: str, data: OnboardingSubmit) -> tuple[str, str]:
        vark_scores = self.scorer.compute_scores(data.vark_answers)
        dominant = max(["V", "A", "R", "K"], key=lambda d: getattr(vark_scores, d.lower()))
        
        profile = LearnerProfile(
            user_id=uuid.UUID(user_id),
            vark_v=vark_scores.v,
            vark_a=vark_scores.a,
            vark_r=vark_scores.r,
            vark_k=vark_scores.k,
            dominant_vark=dominant,
            topic=data.topic,
            goal=data.goal,
            hours_per_week=data.hours_per_week,
            math_comfort=data.math_comfort,
            style_preferences=data.style_preferences,
            prior_knowledge=data.prior_knowledge,
            career_target=data.career_target,
            language=data.language or "en",
        )
        self.db.add(profile)
        await self.db.flush()

        user_result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
        user = user_result.scalar_one()
        user.onboarding_done = True
        user.preferred_language = data.language or "en"

        job = RecommendationJob(
            user_id=uuid.UUID(user_id),
            learner_profile_id=profile.id,
            status="pending",
        )
        self.db.add(job)
        await self.db.flush()

        compute_recommendations_task.delay(str(job.id), str(profile.id))

        return str(job.id), str(profile.id)

    async def get_job_status(self, job_id: str) -> dict:
        result = await self.db.execute(
            select(RecommendationJob).where(RecommendationJob.id == uuid.UUID(job_id))
        )
        job = result.scalar_one_or_none()
        if not job:
            return {"job_id": job_id, "status": "not_found"}
        
        return {
            "job_id": str(job.id),
            "status": job.status,
            "data": None,
            "error": job.error,
        }

    async def get_profile(self, user_id: str) -> LearnerProfileSchema | None:
        result = await self.db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
        )
        profile = result.scalar_one_or_none()
        if not profile:
            return None

        return LearnerProfileSchema(
            id=str(profile.id),
            user_id=str(profile.user_id),
            vark_scores=VarkScores(
                v=profile.vark_v,
                a=profile.vark_a,
                r=profile.vark_r,
                k=profile.vark_k,
                dominant=profile.dominant_vark or "V",
            ),
            topic=profile.topic,
            goal=profile.goal,
            hours_per_week=profile.hours_per_week,
            math_comfort=profile.math_comfort,
            style_preferences=profile.style_preferences,
            prior_knowledge=profile.prior_knowledge,
            career_target=profile.career_target,
            vark_cluster=profile.vark_cluster,
            created_at=profile.created_at.isoformat(),
        )

    async def update_profile(self, user_id: str, data: dict) -> tuple[LearnerProfileSchema, str]:
        result = await self.db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError("PROFILE_NOT_FOUND")

        for key, value in data.items():
            if hasattr(profile, key) and value is not None:
                setattr(profile, key, value)

        job = RecommendationJob(
            user_id=uuid.UUID(user_id),
            learner_profile_id=profile.id,
            status="pending",
        )
        self.db.add(job)
        await self.db.flush()

        compute_recommendations_task.delay(str(job.id), str(profile.id))

        return await self.get_profile(user_id), str(job.id)