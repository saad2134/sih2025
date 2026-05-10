import uuid
import json
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from .config import settings
from .serp_service import serp_service
from .gemini_service import gemini_service


class ConversationManager:
    def __init__(self):
        self.conversations: Dict[str, List[dict]] = {}

    def create_conversation(self, user_id: Optional[str] = None) -> str:
        conv_id = str(uuid.uuid4())
        self.conversations[conv_id] = []
        return conv_id

    def get_conversation(self, conv_id: str) -> List[dict]:
        return self.conversations.get(conv_id, [])

    def add_message(self, conv_id: str, role: str, content: str):
        if conv_id not in self.conversations:
            self.conversations[conv_id] = []

        self.conversations[conv_id].append(
            {
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        limit = settings.CONVERSATION_HISTORY_LIMIT
        if len(self.conversations[conv_id]) > limit:
            self.conversations[conv_id] = self.conversations[conv_id][-limit:]

    def clear_conversation(self, conv_id: str):
        if conv_id in self.conversations:
            del self.conversations[conv_id]


class AICompanion:
    def __init__(self):
        self.conversation_manager = ConversationManager()
        self._init_knowledge_base()
        self.use_gemini = bool(settings.GEMINI_API_KEY)

    async def chat_async(
        self,
        message: str,
        context: Optional[dict] = None,
        conversation_id: Optional[str] = None,
    ) -> dict:
        if conversation_id is None:
            conversation_id = self.conversation_manager.create_conversation(
                user_id=context.get("user_id") if context else None
            )

        self.conversation_manager.add_message(conversation_id, "user", message)

        if self.use_gemini:
            history = self.conversation_manager.get_conversation(conversation_id)
            gemini_response = await gemini_service.chat(
                message=message, history=history, context=context
            )

            if gemini_response.get("success"):
                response = gemini_response.get("text", "")
            else:
                response = self._generate_response(message, context)
        else:
            response = self._generate_response(message, context)

        self.conversation_manager.add_message(conversation_id, "assistant", response)

        suggestions = self._get_suggestions(message)

        resources = []
        if "course" in message.lower() or "learn" in message.lower():
            courses = await self._search_courses_from_message(message)
            resources = courses

        return {
            "response": response,
            "conversation_id": conversation_id,
            "suggestions": suggestions,
            "resources": resources,
        }

    async def _search_courses_from_message(self, message: str) -> List[Dict]:
        keywords = [
            "python",
            "javascript",
            "java",
            "data science",
            "ai",
            "ml",
            "web development",
            "mobile",
            "cloud",
            "devops",
        ]
        topic = None

        for keyword in keywords:
            if keyword in message.lower():
                topic = keyword
                break

        if topic:
            results = await serp_service.search_online_courses(topic)
            return results[:5]
        return []

    def _init_knowledge_base(self):
        self.guidance_templates = {
            "career": [
                "Based on your skills in {skills}, I recommend exploring roles like {roles}. Your experience in {experience} years gives you a solid foundation.",
                "For transitioning to {target_role}, I'd suggest focusing on these key areas: {areas}. Your current background in {current} is a great starting point.",
            ],
            "learning": [
                "To strengthen your {skill} skills, I recommend starting with {resource}. Practice regularly to build mastery.",
                "Based on your learning goals, consider these steps: 1) {step1}, 2) {step2}, 3) {step3}.",
            ],
            "general": [
                "I'm here to help you navigate your career journey. What specific area would you like to explore?",
                "You can ask me about career paths, skill development, job trends, or learning resources.",
            ],
        }

    def _generate_response(self, message: str, context: Optional[dict]) -> str:
        message_lower = message.lower()

        if any(word in message_lower for word in ["career", "job", "role", "position"]):
            return self._career_guidance(message, context)
        elif any(
            word in message_lower for word in ["learn", "course", "skill", "improve"]
        ):
            return self._learning_guidance(message, context)
        elif any(
            word in message_lower for word in ["trend", "future", "forecast", "demand"]
        ):
            return self._trend_guidance(message, context)
        elif any(word in message_lower for word in ["help", "what", "how", "explain"]):
            return self._general_guidance(message, context)
        else:
            return self._general_response(message, context)

    def _career_guidance(self, message: str, context: Optional[dict]) -> str:
        if context and context.get("skills"):
            skills = ", ".join(context.get("skills", []))
            return f"Based on your skills in {skills}, here are some career paths to consider:\n\n1. **Tech Roles**: Software Developer, Data Analyst, Cloud Engineer\n2. **Management**: Project Manager, Team Lead, Technical Manager\n3. **Specialized**: AI/ML Engineer, DevOps Engineer, Security Analyst\n\nWould you like detailed information on any of these paths?"
        return "I'd be happy to help with career guidance! Could you share your current skills and experience so I can provide personalized recommendations?"

    def _learning_guidance(self, message: str, context: Optional[dict]) -> str:
        if context and context.get("skills"):
            skills = ", ".join(context.get("skills", []))
            return f"To further develop your {skills} skills, I recommend:\n\n1. **Practice Projects**: Build real-world applications\n2. **Online Courses**: Platforms like Coursera, Udemy, NPTEL\n3. **Certifications**: Industry-recognized certifications\n4. **Community**: Join relevant developer communities\n\nWhat specific skill would you like to focus on first?"
        return "I can help you with learning paths! What skills are you looking to develop or improve?"

    def _trend_guidance(self, message: str, context: Optional[dict]) -> str:
        return "Based on current industry trends, here are the most in-demand skills:\n\n**High Demand (2024-2025)**:\n- AI/Machine Learning\n- Cloud Computing (AWS, Azure, GCP)\n- Cybersecurity\n- Data Science & Analytics\n- DevOps & Automation\n\n**Emerging Skills**:\n- Generative AI & LLMs\n- Edge Computing\n- Blockchain (enterprise)\n- Quantum Computing basics\n\nWould you like me to provide a detailed skill forecast for your industry?"

    def _general_guidance(self, message: str, context: Optional[dict]) -> str:
        return "I'm your AI Learning Companion! Here's how I can help you:\n\n🎯 **Career Guidance** - Explore career paths based on your skills\n📚 **Learning Paths** - Get personalized course recommendations\n🔮 **Skill Forecasts** - Discover emerging and declining skills\n⚠️ **Industry Alerts** - Stay updated on market changes\n\nWhat would you like to explore today?"

    def _general_response(self, message: str, context: Optional[dict]) -> str:
        responses = [
            "That's an interesting question! Let me help you with that.",
            "Great question! Here's what I think...",
            "I'd be happy to discuss that. Let me share some insights.",
            "Thanks for asking! Here's my perspective on that.",
        ]
        return (
            responses[hash(message) % len(responses)]
            + " "
            + self._general_guidance(message, context)
        )

    def _get_suggestions(self, message: str) -> List[str]:
        message_lower = message.lower()
        suggestions = []

        if any(word in message_lower for word in ["career", "job"]):
            suggestions = [
                "What careers match my skills?",
                "How do I transition to a new role?",
                "What skills are in demand?",
            ]
        elif any(word in message_lower for word in ["learn", "course"]):
            suggestions = [
                "Create a learning plan",
                "Best resources for my skills",
                "How long to master a skill?",
            ]
        elif any(word in message_lower for word in ["skill", "trend"]):
            suggestions = [
                "Future skill forecasts",
                "Emerging skills in my industry",
                "Skills to deprioritize",
            ]
        else:
            suggestions = [
                "Help me plan my career",
                "What should I learn next?",
                "Show me industry trends",
            ]

        return suggestions[:3]

    def chat(
        self,
        message: str,
        context: Optional[dict] = None,
        conversation_id: Optional[str] = None,
    ) -> dict:
        if conversation_id is None:
            conversation_id = self.conversation_manager.create_conversation(
                user_id=context.get("user_id") if context else None
            )

        self.conversation_manager.add_message(conversation_id, "user", message)

        response = self._generate_response(message, context)

        self.conversation_manager.add_message(conversation_id, "assistant", response)

        suggestions = self._get_suggestions(message)

        return {
            "response": response,
            "conversation_id": conversation_id,
            "suggestions": suggestions,
            "resources": [],
        }


companion = AICompanion()
