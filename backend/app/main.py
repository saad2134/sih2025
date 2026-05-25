"""FastAPI main application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, HTTPException
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
    payments_router,
    companion_router,
    feedback_router,
    contact_router,
    resume_router,
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

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
app.include_router(payments_router, prefix="/api/v1")
app.include_router(companion_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(contact_router, prefix="/api/v1")
app.include_router(resume_router, prefix="/api/v1")


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


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    code = "HTTP_ERROR"
    message = str(exc.detail)
    details = None
    
    if isinstance(exc.detail, dict):
        code = exc.detail.get("code", "HTTP_ERROR")
        message = exc.detail.get("message", str(exc.detail))
        details = exc.detail.get("details")
        
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "success": False,
            "error": {
                "code": code,
                "message": message,
                "details": details
            }
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    error_msg = str(exc)
    
    if error_msg in ["INVALID_TOKEN", "TOKEN_EXPIRED"]:
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "error": {
                    "code": error_msg,
                    "message": "Invalid or expired authorization token"
                }
            }
        )
    elif error_msg == "USER_NOT_FOUND":
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "error": {
                    "code": "USER_NOT_FOUND",
                    "message": "User not found"
                }
            }
        )
    elif error_msg == "PROFILE_NOT_FOUND":
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "error": {
                    "code": "PROFILE_NOT_FOUND",
                    "message": "Learner profile not found"
                }
            }
        )
    elif error_msg == "DUPLICATE_EMAIL":
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "EMAIL_ALREADY_EXISTS",
                    "message": "Email already registered"
                }
            }
        )
    elif error_msg == "INVALID_PASSWORD":
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "error": {
                    "code": "INVALID_PASSWORD",
                    "message": "Incorrect password"
                }
            }
        )
        
    return JSONResponse(
        status_code=400,
        content={
            "success": False,
            "error": {
                "code": "BAD_REQUEST",
                "message": error_msg
            }
        }
    )


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