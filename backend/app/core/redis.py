"""
Redis Connection & Caching Layer Setup
"""
import redis.asyncio as aioredis
from app.core.config import settings

redis_client: aioredis.Redis = aioredis.from_url(
    settings.REDIS_URL,
    encoding="utf-8",
    decode_responses=True,
)


async def get_redis():
    """Dependency for obtaining async Redis client."""
    return redis_client
