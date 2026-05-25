"""API routers."""

from app.routers.auth import router as auth_router
from app.routers.onboarding import router as onboarding_router
from app.routers.recommendations import router as recommendations_router
from app.routers.courses import router as courses_router
from app.routers.career import router as career_router
from app.routers.reviews import router as reviews_router
from app.routers.payments import router as payments_router
from app.routers.companion import router as companion_router
from app.routers.feedback import router as feedback_router, contact_router