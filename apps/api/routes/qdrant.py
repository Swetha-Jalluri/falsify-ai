from fastapi import APIRouter, HTTPException

from db.qdrant_client import QDRANT_URL, get_qdrant

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
