from app.api.router.auth import router as auth_router
from app.api.router.onboarding import router as onboarding_router
from app.api.router.recommendations import router as recommendations_router
from app.api.router.courses import router as courses_router
from app.api.router.adaptive import router as adaptive_router
from app.api.router.player import router as player_router

__all__ = [
    "auth_router",
    "onboarding_router",
    "recommendations_router",
    "courses_router",
    "adaptive_router",
    "player_router",
]
