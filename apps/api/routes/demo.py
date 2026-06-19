from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase

router = APIRouter(prefix="/demo", tags=["demo"])

_AMZN_TICKER = "AMZN"
_AMZN_NAME = "Amazon.com, Inc."
_AMZN_SECTOR = "Technology / Consumer Internet"
_AMZN_THESIS = (
    "Amazon will continue strengthening because AWS and AI infrastructure "
    "demand remain strong."
)


@router.post("/seed-amzn")
def seed_amzn() -> dict:
    """
    Idempotent demo seed endpoint.

    Creates the AMZN company and a demo thesis if they do not already exist.
    Safe to call multiple times — will reuse existing records rather than
    creating duplicates.
    """
    try:
        db = get_supabase()

        # ── Company ──────────────────────────────────────────────────────────
        company_result = (
            db.table("companies")
            .select("*")
            .eq("ticker", _AMZN_TICKER)
            .execute()
        )

        if company_result.data:
            company = company_result.data[0]
        else:
            insert_result = (
                db.table("companies")
                .insert({
                    "ticker": _AMZN_TICKER,
                    "name": _AMZN_NAME,
                    "sector": _AMZN_SECTOR,
                })
                .execute()
            )
            company = insert_result.data[0]

        # ── Thesis ───────────────────────────────────────────────────────────
        thesis_result = (
            db.table("theses")
            .select("*")
            .eq("company_ticker", _AMZN_TICKER)
            .eq("thesis_text", _AMZN_THESIS)
            .execute()
        )

        if thesis_result.data:
            thesis = thesis_result.data[0]
        else:
            insert_result = (
                db.table("theses")
                .insert({
                    "company_ticker": _AMZN_TICKER,
                    "thesis_text": _AMZN_THESIS,
                })
                .execute()
            )
            thesis = insert_result.data[0]

        return {
            "company": company,
            "thesis": thesis,
            "message": "AMZN demo data is ready.",
        }

    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
