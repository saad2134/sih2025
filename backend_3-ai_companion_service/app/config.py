import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    SKILL_TRENDS_PATH: str = os.getenv("SKILL_TRENDS_PATH", "./data/skill_trends.csv")
    ALERTS_PATH: str = os.getenv("ALERTS_PATH", "./data/industry_alerts.csv")
    CONVERSATION_HISTORY_LIMIT: int = 50
    MAX_TOKENS: int = 500
    TEMPERATURE: float = 0.7

    SERP_API_KEY: str = os.getenv("SERP_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    FIRECRAWL_API_KEY: str = os.getenv("FIRECRAWL_API_KEY", "")

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
