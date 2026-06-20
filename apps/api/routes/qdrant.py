from fastapi import APIRouter, HTTPException
from qdrant_client.models import Distance, VectorParams

from db.qdrant_client import QDRANT_COLLECTION, QDRANT_URL, get_qdrant

router = APIRouter(prefix="/qdrant", tags=["qdrant"])


@router.get("/health")
def qdrant_health() -> dict:
    """
    Check whether the Qdrant vector database is reachable.

    Returns 200 with status ok if Qdrant responds, or 503 if it is not reachable.
    """
    try:
        client = get_qdrant()
        client.get_collections()  # lightweight call; fails immediately if unreachable
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Qdrant is not reachable at {QDRANT_URL}: {exc}",
        )

    return {"status": "ok", "qdrant_url": QDRANT_URL}


_VECTOR_SIZE = 384
_DISTANCE = Distance.COSINE


def _ensure_collection() -> dict:
    """
    Create the Qdrant collection for RAG chunks if it does not already exist.

    Returns a dict with status, collection name, and whether it was created.
    Raises HTTPException on connectivity or creation failure.
    """
    try:
        client = get_qdrant()
        existing = {c.name for c in client.get_collections().collections}
    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Qdrant is not reachable at {QDRANT_URL}: {exc}",
        )

    if QDRANT_COLLECTION in existing:
        return {"status": "ok", "collection": QDRANT_COLLECTION, "created": False}

    try:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(size=_VECTOR_SIZE, distance=_DISTANCE),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create collection '{QDRANT_COLLECTION}': {exc}",
        )

    return {"status": "ok", "collection": QDRANT_COLLECTION, "created": True}


@router.post("/collections/setup", status_code=200)
def setup_collection() -> dict:
    """Create or verify the Qdrant collection. Idempotent."""
    return _ensure_collection()


@router.post("/collections/init", status_code=200)
def init_collection() -> dict:
    """Create or verify the Qdrant collection. Idempotent."""
    return _ensure_collection()
