"""Redis connection management."""

import redis.asyncio as redis
from typing import AsyncGenerator

from app.config import settings

redis_pool = redis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    try:
        yield redis_pool
    finally:
        pass


async def close_redis():
    await redis_pool.close()