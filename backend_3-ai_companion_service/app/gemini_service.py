import httpx
import json
from typing import List, Dict, Optional
from .config import settings


class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"
        self.default_model = "gemini-2.0-flash"

    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 500,
        system_instruction: Optional[str] = None,
    ) -> Dict:
        url = f"{self.base_url}?key={self.api_key}"

        contents = [{"parts": [{"text": prompt}]}]

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
                "topP": 0.95,
                "topK": 40,
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload)
                data = response.json()
                return self._parse_response(data)
            except Exception as e:
                return {"error": str(e), "success": False}

    def _parse_response(self, data: Dict) -> Dict:
        try:
            candidates = data.get("candidates", [])
            if candidates:
                content = candidates[0].get("content", {})
                parts = content.get("parts", [])
                if parts:
                    return {"text": parts[0].get("text", ""), "success": True}
            return {"text": "", "success": False, "error": "No response from Gemini"}
        except Exception as e:
            return {"error": str(e), "success": False}

    async def chat(
        self, message: str, history: List[Dict] = None, context: Optional[Dict] = None
    ) -> Dict:
        system_prompt = """You are ShikshaDisha's AI Learning Companion, designed to help students and professionals with:
- Career guidance and planning
- Skill development recommendations
- Course suggestions
- Learning strategies
- Industry trends and forecasts

Provide helpful, accurate, and encouraging responses. Keep responses concise and actionable."""

        conversation = []

        if history:
            for msg in history[-10:]:
                role = "model" if msg.get("role") == "assistant" else "user"
                conversation.append(
                    {"role": role, "parts": [{"text": msg.get("content", "")}]}
                )

        conversation.append({"role": "user", "parts": [{"text": message}]})

        url = f"{self.base_url}?key={self.api_key}"

        payload = {
            "contents": conversation,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 500,
                "topP": 0.95,
                "topK": 40,
            },
            "systemInstruction": {"parts": [{"text": system_prompt}]},
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                response = await client.post(url, json=payload)
                data = response.json()
                return self._parse_response(data)
            except Exception as e:
                return {"error": str(e), "success": False, "text": ""}

    async def generate_career_guidance(
        self,
        skills: List[str],
        experience_years: float,
        target_role: Optional[str] = None,
    ) -> Dict:
        skills_str = ", ".join(skills)

        prompt = f"""Based on the following user profile:
- Current Skills: {skills_str}
- Experience: {experience_years} years
- Target Role: {target_role or "Not specified"}

Provide:
1. Career path recommendations
2. Skills to develop
3. Potential job roles
4. Recommended learning resources

Be specific and actionable."""

        return await self.generate_content(prompt)

    async def generate_learning_plan(
        self,
        topic: str,
        current_level: str = "beginner",
        time_available: str = "1 hour daily",
    ) -> Dict:
        prompt = f"""Create a learning plan for {topic}:
- Current Level: {current_level}
- Time Available: {time_available}

Include:
1. Week-by-week breakdown
2. Key topics to cover
3. Practice exercises
4. Milestones to achieve
5. Resource recommendations"""

        return await self.generate_content(prompt)


gemini_service = GeminiService()
