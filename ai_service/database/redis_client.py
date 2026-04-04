import os
import redis

REDIS_URL = os.getenv("REDIS_HOST")

redis_client = redis.from_url(
    REDIS_URL,
    decode_responses=True,
    socket_timeout=5
)