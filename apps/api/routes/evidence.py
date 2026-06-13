from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.evidence import EvidenceCreate, EvidenceResponse

router = APIRouter(prefix="/evidence", tags=["evidence"])


@router.get("", response_model=list[EvidenceResponse])
def list_evidence() -> list[dict]:
    try:
        result = get_supabase().table("evidence").select("*").execute()
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/thesis/{thesis_id}", response_model=list[EvidenceResponse])
def list_evidence_by_thesis(thesis_id: str) -> list[dict]:
    try:
        result = (
            get_supabase()
            .table("evidence")
            .select("*")
            .eq("thesis_id", thesis_id)
            .execute()
        )
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=EvidenceResponse, status_code=201)
def create_evidence(body: EvidenceCreate) -> dict:
    try:
        result = (
            get_supabase()
            .table("evidence")
            .insert(
                {
                    "thesis_id": body.thesis_id,
                    "company_ticker": body.company_ticker,
                    "source_type": body.source_type,
                    "source_title": body.source_title,
                    "source_url": body.source_url,
                    "evidence_text": body.evidence_text,
                    "stance": body.stance,
                }
            )
            .execute()
        )
        return result.data[0]
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
