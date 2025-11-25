import json
from typing import Any, Optional

import redis

from app.config import get_settings

settings = get_settings()


class CacheService:
    def __init__(self) -> None:
        self.client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    def set_snapshot(self, key: str, payload: dict[str, Any], ttl_seconds: int = 3600) -> None:
        serialized = json.dumps(payload)
        self.client.setex(key, ttl_seconds, serialized)

    def get_snapshot(self, key: str) -> Optional[dict[str, Any]]:
        value = self.client.get(key)
        if not value:
            return None
        return json.loads(value)

