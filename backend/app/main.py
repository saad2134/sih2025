"""FastAPI main application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import sentry_sdk

from app.config import settings
from app.middleware.rate_limit import limiter
from app.middleware.request_id import RequestIDMiddleware
from app.db.redis import close_redis
from app.routers import (
    auth_router,
    onboarding_router,
    recommendations_router,
    courses_router,
    career_router,
    reviews_router,
)


if settings.SENTRY_DSN:
    sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await close_redis()


app = FastAPI(
    title="ShikshaDisha API",
    description="AI-Powered NSQF-Integrated Learning Ecosystem",
    version=settings.VERSION,
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestIDMiddleware)

app.include_router(auth_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1")
app.include_router(recommendations_router, prefix="/api/v1")
app.include_router(courses_router, prefix="/api/v1")
app.include_router(career_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health_check():
    from app.db.session import engine
    from app.db.redis import redis_pool
    
    db_status = "ok"
    redis_status = "ok"
    
    from sqlalchemy import text
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"
    
    try:
        await redis_pool.ping()
    except Exception:
        redis_status = "error"
    
    return {
        "status": "healthy" if db_status == "ok" and redis_status == "ok" else "degraded",
        "version": settings.VERSION,
        "database": db_status,
        "redis": redis_status,
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    sentry_id = None
    if settings.SENTRY_DSN:
        sentry_id = sentry_sdk.last_event_id()
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "sentry_id": sentry_id,
            }
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)