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
from app.config import settings


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


async def validate_and_clean_role(role: str) -> str:
    if not role or not role.strip():
        raise ValueError("Please enter a valid career role.")
    
    cleaned = role.strip()
    role_lower = cleaned.lower()
    
    STANDARD_ROLES = {
        "software engineer", "frontend developer", "backend developer", "fullstack developer",
        "data scientist", "mlops engineer", "ai engineer", "data analyst", "cloud engineer",
        "devops engineer", "cybersecurity specialist", "ui/ux designer", "product manager",
        "mobile developer", "game developer", "database administrator", "systems administrator",
        "network engineer", "security engineer", "qa engineer", "software test engineer",
        "electrician", "plumber", "digital marketer", "graphic designer", "welder"
    }
    
    if role_lower in STANDARD_ROLES:
        return cleaned.title()
        
    if len(cleaned) < 3 or len(cleaned) > 50:
        raise ValueError("Please enter a valid professional career role.")
        
    from app.config import settings
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            import json
            import asyncio
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.5-flash")
            
            prompt = f"""
            Determine if the following input string is a valid, recognized professional career role or occupation (e.g. Software Engineer, Doctor, Electrician, Plumber, MLops Engineer, etc.).
            Input: "{cleaned}"
            
            Return a JSON object:
            {{
              "is_valid": true/false,
              "corrected_name": "Standard Title capitalized if valid, or empty string if invalid"
            }}
            
            Return ONLY raw JSON. No comments, no markdown formatting.
            """
            
            response = await asyncio.to_thread(
                model.generate_content,
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            res_data = json.loads(response.text.strip())
            if not res_data.get("is_valid"):
                raise ValueError("Please enter a valid professional career role.")
            
            corrected = res_data.get("corrected_name", "").strip()
            if corrected:
                return corrected
            return cleaned
        except ValueError as e:
            raise e
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(f"Gemini role validation failed: {e}")
            return cleaned
            
    import re
    if re.match(r"^[a-zA-Z\s\-]+$", cleaned) and len(cleaned.split()) >= 1:
        return cleaned
        
    raise ValueError("Please enter a valid professional career role.")


class OnboardingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.scorer = VARKScorer()

    async def get_quiz(self) -> QuizResponse:
        return QuizResponse(questions=VARK_QUIZ)

    async def submit_onboarding(self, user_id: str, data: OnboardingSubmit) -> tuple[str, str]:
        if data.career_target:
            data.career_target = await validate_and_clean_role(data.career_target)

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

        if settings.ENVIRONMENT == "development":
            import asyncio
            from app.tasks.recommendations import compute_recommendations_async
            asyncio.create_task(compute_recommendations_async(str(job.id), str(profile.id)))
        else:
            from app.tasks.recommendations import compute_recommendations_task
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
        if "career_target" in data and data["career_target"] is not None:
            data["career_target"] = await validate_and_clean_role(data["career_target"])

        result = await self.db.execute(
            select(LearnerProfile).where(LearnerProfile.user_id == uuid.UUID(user_id))
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError("PROFILE_NOT_FOUND")

        # Update full name if provided
        if "full_name" in data and data["full_name"] is not None:
            user_result = await self.db.execute(select(User).where(User.id == uuid.UUID(user_id)))
            user = user_result.scalar_one_or_none()
            if user:
                user.full_name = data["full_name"]

        for key, value in data.items():
            if hasattr(profile, key) and value is not None and key not in ["id", "user_id"]:
                setattr(profile, key, value)

        # Mark career map stale on profile update
        from app.models.career_map import CareerMapSnapshot
        cmap_result = await self.db.execute(
            select(CareerMapSnapshot).where(CareerMapSnapshot.user_id == uuid.UUID(user_id))
        )
        cmap = cmap_result.scalar_one_or_none()
        if cmap:
            cmap.is_stale = True

        job = RecommendationJob(
            user_id=uuid.UUID(user_id),
            learner_profile_id=profile.id,
            status="pending",
        )
        self.db.add(job)
        await self.db.flush()

        if settings.ENVIRONMENT == "development":
            import asyncio
            from app.tasks.recommendations import compute_recommendations_async
            asyncio.create_task(compute_recommendations_async(str(job.id), str(profile.id)))
        else:
            from app.tasks.recommendations import compute_recommendations_task
            compute_recommendations_task.delay(str(job.id), str(profile.id))

        return await self.get_profile(user_id), str(job.id)