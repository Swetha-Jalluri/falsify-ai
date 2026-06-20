import os

from qdrant_client import QdrantClient

# Read from environment; default to local Docker Compose instance.
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")


def get_qdrant() -> QdrantClient:
    return QdrantClient(url=QDRANT_URL)
