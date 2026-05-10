from redis.asyncio import Redis
from app.config import settings


redis_pool: Redis = None


async def get_redis() -> Redis:
    global redis_pool
    if redis_pool is None:
        redis_pool = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_pool


async def close_redis():
    global redis_pool
    if redis_pool:
        await redis_pool.aclose()
        redis_pool = None
