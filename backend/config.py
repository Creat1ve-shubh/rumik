"""
CMP Configuration — all service URLs, model settings, and planner knobs.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # ─── API ───
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True

    # ─── Neo4j ───
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "cmppassword"

    # ─── Qdrant ───
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "cmp_memories"

    # ─── Redis ───
    REDIS_URL: str = "redis://localhost:6379/0"

    # ─── Embedding Model ───
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIM: int = 384

    # ─── Planner Knobs ───
    DEFAULT_LATENCY_BUDGET_MS: int = 2000
    PLANNER_CONFIDENCE_THRESHOLD: float = 0.7
    MAX_RETRIEVAL_DEPTH: int = 2
    MAX_RETRIEVAL_NODES: int = 100

    # ─── vLLM / External Model ───
    VLLM_BASE_URL: Optional[str] = None
    REASONING_MODEL: str = "qwen3-14b"

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
