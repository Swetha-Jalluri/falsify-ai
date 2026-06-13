from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.drift_verdict import VERDICT_VALUES, DriftVerdictCreate, DriftVerdictResponse

router = APIRouter(prefix="/drift-verdicts", tags=["drift-verdicts"])


@router.get("", response_model=list[DriftVerdictResponse])
def list_drift_verdicts() -> list[dict]:
    try:
        result = get_supabase().table("drift_verdicts").select("*").execute()
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/thesis/{thesis_id}", response_model=list[DriftVerdictResponse])
def list_drift_verdicts_by_thesis(thesis_id: str) -> list[dict]:
    try:
        result = (
            get_supabase()
            .table("drift_verdicts")
            .select("*")
            .eq("thesis_id", thesis_id)
            .execute()
        )
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=DriftVerdictResponse, status_code=201)
def create_drift_verdict(body: DriftVerdictCreate) -> dict:
    if body.verdict not in VERDICT_VALUES:
        raise HTTPException(
            status_code=422,
            detail=f"verdict must be one of: {', '.join(sorted(VERDICT_VALUES))}",
        )
    try:
        result = (
            get_supabase()
            .table("drift_verdicts")
            .insert(
                {
                    "thesis_id": body.thesis_id,
                    "company_ticker": body.company_ticker,
                    "verdict": body.verdict,
                    "confidence": body.confidence,
                    "rationale": body.rationale,
                }
            )
            .execute()
        )
        return result.data[0]
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
