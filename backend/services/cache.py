"""
Redis Cache Manager
Used for Phase 7 performance improvements (caching embeddings, queries, intent prototypes).
Gracefully falls back to an in-memory dictionary.
"""

import json
import logging
from typing import Any, Optional
from config import settings

logger = logging.getLogger("cmp.cache")

class CacheManager:
    def __init__(self):
        self._redis = None
        self._connected = False
        self._mem_cache = {}

    @property
    def is_connected(self) -> bool:
        return self._connected

    async def connect(self):
        try:
            import redis.asyncio as redis
            self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
            await self._redis.ping()
            self._connected = True
            logger.info("Connected to Redis")
        except Exception as e:
            logger.warning(f"Redis not available: {e} — using in-memory cache")
            self._connected = False

    async def close(self):
        if self._redis:
            await self._redis.close()

    async def get(self, key: str) -> Optional[Any]:
        if not self._connected:
            return self._mem_cache.get(key)
        
        try:
            val = await self._redis.get(key)
            if val:
                return json.loads(val)
            return None
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None

    async def set(self, key: str, value: Any, expire_sec: int = 3600) -> bool:
        if not self._connected:
            self._mem_cache[key] = value
            return True
            
        try:
            await self._redis.set(key, json.dumps(value), ex=expire_sec)
            return True
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return False
