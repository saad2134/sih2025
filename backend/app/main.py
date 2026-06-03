from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime
import logging
import sys

from app.config import settings
from app.api import (
    auth_router,
    onboarding_router,
    recommendations_router,
    courses_router,
    adaptive_router,
    player_router,
)
from app.db.session import engine, Base
from app.db.redis import close_redis

if settings.SENTRY_DSN:
    import sentry_sdk

    sentry_sdk.init(dsn=settings.SENTRY_DSN, environment=settings.ENVIRONMENT)

log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    handlers=[logging.StreamHandler(sys.stdout)],
)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await close_redis()
    await engine.dispose()


app = FastAPI(
    title="ShikshaDisha API",
    description="AI-Powered Vocational Pathway Navigator - Backend PRD v3.0",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    import uuid

    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import sentry_sdk

    sentry_id = sentry_sdk.last_event_id() if settings.SENTRY_DSN else None
    log.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": {"sentry_id": sentry_id} if sentry_id else {},
            },
        },
    )


app.include_router(auth_router, prefix="/api/v1")
app.include_router(onboarding_router, prefix="/api/v1")
app.include_router(recommendations_router, prefix="/api/v1")
app.include_router(courses_router, prefix="/api/v1")
app.include_router(adaptive_router, prefix="/api")
app.include_router(player_router, prefix="/api")


@app.get("/", tags=["Root"])
def root():
    return {"service": "ShikshaDisha API", "version": "1.0.0", "status": "operational"}


@app.get("/health", tags=["Root"])
async def health_check():
    db_status = "unknown"
    redis_status = "unknown"
    try:
        from app.db.session import async_session_maker

        async with async_session_maker() as session:
            await session.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    try:
        from app.db.redis import get_redis

        r = await get_redis()
        await r.ping()
        redis_status = "connected"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    return {
        "status": "healthy"
        if db_status == "connected" and redis_status == "connected"
        else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "redis": redis_status,
        "environment": settings.ENVIRONMENT,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
