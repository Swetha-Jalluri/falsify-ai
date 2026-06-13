from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.drift_verdict import DriftVerdictResponse

router = APIRouter(prefix="/analyze", tags=["analyzer"])


@router.post("/thesis/{thesis_id}", response_model=DriftVerdictResponse, status_code=201)
def analyze_thesis(thesis_id: str) -> dict:
    """
    Run a rule-based drift analysis on a thesis.

    Counts evidence by stance and writes a new drift verdict to the database.
    """
    try:
        db = get_supabase()

        # Fetch all evidence for this thesis
        evidence_result = (
            db.table("evidence").select("*").eq("thesis_id", thesis_id).execute()
        )
        evidence_rows = evidence_result.data

        # Determine company_ticker
        if evidence_rows:
            company_ticker = evidence_rows[0]["company_ticker"]
        else:
            # No evidence — look up the thesis directly to get the ticker
            thesis_result = (
                db.table("theses").select("*").eq("id", thesis_id).execute()
            )
            if not thesis_result.data:
                raise HTTPException(
                    status_code=404,
                    detail=f"No thesis found with id '{thesis_id}'.",
                )
            company_ticker = thesis_result.data[0]["company_ticker"]

        # Compute verdict from evidence counts
        verdict, confidence, rationale = _compute_verdict(evidence_rows)

        # Persist the verdict
        insert_result = (
            db.table("drift_verdicts")
            .insert(
                {
                    "thesis_id": thesis_id,
                    "company_ticker": company_ticker,
                    "verdict": verdict,
                    "confidence": round(confidence, 4),
                    "rationale": rationale,
                }
            )
            .execute()
        )
        return insert_result.data[0]

    except HTTPException:
        raise
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


def _compute_verdict(evidence_rows: list[dict]) -> tuple[str, float, str]:
    """Return (verdict, confidence, rationale) based on evidence stance counts."""

    if not evidence_rows:
        return (
            "needs_more_evidence",
            0.0,
            "No evidence has been added for this thesis yet.",
        )

    total = len(evidence_rows)
    supports = sum(1 for e in evidence_rows if e.get("stance") == "supports")
    contradicts = sum(1 for e in evidence_rows if e.get("stance") == "contradicts")

    if supports > contradicts:
        return (
            "supported",
            supports / total,
            f"{supports} of {total} evidence item(s) support the thesis, "
            f"outweighing {contradicts} contradicting item(s). "
            "The thesis appears to be holding.",
        )

    if contradicts > supports:
        return (
            "contradicted",
            contradicts / total,
            f"{contradicts} of {total} evidence item(s) contradict the thesis, "
            f"outweighing {supports} supporting item(s). "
            "The thesis shows signs of deterioration.",
        )

    # supports == contradicts (and total > 0)
    return (
        "weakening",
        0.5,
        f"Evidence is mixed — {supports} item(s) support and {contradicts} item(s) "
        "contradict the thesis. More evidence is needed to reach a clear verdict.",
    )
