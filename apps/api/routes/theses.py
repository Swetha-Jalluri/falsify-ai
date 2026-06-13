from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.thesis import ThesisCreate, ThesisResponse

router = APIRouter(prefix="/theses", tags=["theses"])


@router.get("", response_model=list[ThesisResponse])
def list_theses() -> list[dict]:
    try:
        result = get_supabase().table("theses").select("*").execute()
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=ThesisResponse, status_code=201)
def create_thesis(body: ThesisCreate) -> dict:
    try:
        result = (
            get_supabase()
            .table("theses")
            .insert(
                {
                    "company_ticker": body.company_ticker,
                    "thesis_text": body.thesis_text,
                    "status": "active",
                }
            )
            .execute()
        )
        return result.data[0]
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
