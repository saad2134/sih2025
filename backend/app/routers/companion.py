"""AI Companion chat router - uses Gemini to provide context-aware skilling guidance."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis
from pydantic import BaseModel
from typing import List, Optional
import asyncio

from app.db.session import get_db
from app.db.redis import get_redis
from app.services.auth import AuthService
from app.config import settings
from app.schemas.common import ApiResponse
from app.models.onboarding import LearnerProfile

router = APIRouter(prefix="/companion", tags=["companion"])


class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str


class ChatPayload(BaseModel):
    message: str
    history: List[ChatMessage] = []


@router.post("/chat")
async def companion_chat(
    payload: ChatPayload,
    db: AsyncSession = Depends(get_db),
    redis_client: redis.Redis = Depends(get_redis),
    authorization: str = Header(None),
):
    """Context-aware companion chatbot endpoint."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace("Bearer ", "")
    auth_service = AuthService(db, redis_client)
    user = await auth_service.get_current_user(token)

    # Fetch learner profile
    from sqlalchemy import select
    result = await db.execute(
        select(LearnerProfile).where(LearnerProfile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(status_code=403, detail="Please complete onboarding first")

    # Fallback if Gemini key is missing
    if not settings.GEMINI_API_KEY:
        mock_response = (
            f"Hey {user.full_name}! 👋 I am your AI Study Companion. "
            f"Currently running in demo/sandbox mode because GEMINI_API_KEY is not configured.\n\n"
            f"Based on your profile, you are focusing on **{profile.topic}** with the goal of **{profile.goal}** "
            f"and target career as **{profile.career_target or 'Not Set'}**. "
            f"You have chosen a study workload of **{profile.hours_per_week} hours/week**. "
            f"How can I help you tackle your learning targets today?"
        )
        return ApiResponse.ok({
            "response": mock_response,
            "is_mock": True
        })

    # Prepare context-aware system instruction
    system_instruction = (
        f"You are 'ShikshaDisha Companion', a warm, empathetic, and highly supportive AI learning companion and career mentor for students in India.\n"
        f"Your goal is to guide them along their learning journey, explain concepts clearly, keep them motivated, and help them navigate vocational skilling paths.\n\n"
        f"Student Profile:\n"
        f"- Full Name: {user.full_name}\n"
        f"- Career Target: {profile.career_target or 'Not specified yet'}\n"
        f"- Learning Goal: {profile.goal}\n"
        f"- Focus Topic: {profile.topic}\n"
        f"- Hours available per week: {profile.hours_per_week} hours\n"
        f"- Math Comfort Level: {profile.math_comfort}/4\n"
        f"- Prior Knowledge: {profile.prior_knowledge}\n"
        f"- Dominant Learning Styles (VARK alignment): Visual: {profile.vark_v:.2f}, Auditory: {profile.vark_a:.2f}, Reading/Writing: {profile.vark_r:.2f}, Kinesthetic: {profile.vark_k:.2f}\n"
        f"- Style Preferences: {', '.join(profile.style_preferences) if profile.style_preferences else 'None specified'}\n"
        f"- Preferred Language: {profile.language}\n\n"
        f"Guidelines:\n"
        f"1. Match the student's VARK preferences in your explanations. Use formatting and visual breakdowns for visual learners, clear lists/reading material recommendations for reading/writing, and propose coding/exercises for kinesthetic.\n"
        f"2. Suggest small actionable steps and motivate the student. Keep responses structured and easy to read."
    )

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )

        # Build contents from history
        contents = []
        for msg in payload.history:
            contents.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })
        contents.append({
            "role": "user",
            "parts": [payload.message]
        })

        response = await asyncio.to_thread(
            model.generate_content,
            contents
        )

        return ApiResponse.ok({
            "response": response.text,
            "is_mock": False
        })
    except Exception as e:
        # Fallback in case of API failure
        return ApiResponse.ok({
            "response": f"Sorry, I encountered an error communicating with Gemini: {str(e)}. How else can I assist you?",
            "is_mock": True
        })
