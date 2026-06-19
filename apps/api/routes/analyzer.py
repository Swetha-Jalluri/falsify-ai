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
    neutral = sum(1 for e in evidence_rows if e.get("stance") == "neutral")
    sec_facts = sum(
        1 for e in evidence_rows if e.get("source_type") == "sec_financial_fact"
    )

    # Build the base summary line
    summary = (
        f"Analyzed {total} evidence row(s): "
        f"{supports} supporting, {contradicts} contradicting, {neutral} neutral."
    )

    # Append SEC context note when SEC financial facts are present
    sec_note = ""
    if sec_facts > 0:
        sec_note = (
            f" {sec_facts} row(s) came from SEC financial facts. "
            "SEC financial evidence is treated as factual context and does not "
            "dominate the verdict unless classified as supporting or contradicting."
        )

    if supports > contradicts:
        verdict_detail = (
            f" {supports} supporting item(s) outweigh {contradicts} contradicting item(s). "
            "The thesis appears to be holding."
        )
        return (
            "supported",
            supports / total,
            summary + sec_note + verdict_detail,
        )

    if contradicts > supports:
        verdict_detail = (
            f" {contradicts} contradicting item(s) outweigh {supports} supporting item(s). "
            "The thesis shows signs of deterioration."
        )
        return (
            "contradicted",
            contradicts / total,
            summary + sec_note + verdict_detail,
        )

    # supports == contradicts (and total > 0)
    verdict_detail = (
        f" Evidence is mixed — {supports} item(s) support and {contradicts} item(s) "
        "contradict the thesis. More evidence is needed to reach a clear verdict."
    )
    return (
        "weakening",
        0.5,
        summary + sec_note + verdict_detail,
    )
