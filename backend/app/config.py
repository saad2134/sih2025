"""Application configuration using pydantic-settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/shikshadisha"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    SECRET_KEY: str = "change-me-in-production-use-32-char-minimum"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    GEMINI_API_KEY: str = ""
    SERP_API_KEY: str = ""
    FIRECRAWL_API_KEY: str = ""
    POLAR_API_KEY: str = ""
    POLAR_WEBHOOK_SECRET: str = ""
    POLAR_PRO_CHECKOUT_URL: str = ""
    POLAR_PREMIUM_CHECKOUT_URL: str = ""
    POLAR_PRO_PRODUCT_ID: str = ""
    POLAR_PREMIUM_PRODUCT_ID: str = ""
    APPS_SCRIPT_URL: str = ""
    
    UPLOADCARE_PUBLIC_KEY: str = ""
    UPLOADCARE_SECRET_KEY: str = ""

    CORS_ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000"

    SENTRY_DSN: str = ""
    ENVIRONMENT: str = "development"
    RATE_LIMIT_PER_MINUTE: int = 60
    
    VERSION: str = "1.0.0"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()