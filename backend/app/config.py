from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = (
        "postgresql+asyncpg://postgres:postgres@localhost:5432/shikshadisha"
    )
    DATABASE_URL_SYNC: str = (
        "postgresql://postgres:postgres@localhost:5432/shikshadisha"
    )
    REDIS_URL: str = "redis://localhost:6379/0"

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GEMINI_API_KEY: Optional[str] = None
    FIRECRAWL_API_KEY: Optional[str] = None
    SERPAPI_API_KEY: Optional[str] = None
    SENTRY_DSN: Optional[str] = None
    ENVIRONMENT: str = "development"

    NSQF_COURSES_PATH: str = "data/nsqf_courses.csv"
    EMBEDS_PATH: str = "models/embeddings.npy"
    META_PATH: str = "models/meta.pkl"
    INDEX_PATH: str = "models/courses.faiss"

    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"


settings = Settings()
