from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from routes.analyzer import _compute_verdict
from routes.sec import (
    SEC_FACTS_URL,
    _SUMMARY_CONCEPTS,
    _existing_sec_titles,
    _fetch_company_facts,
    _latest_annual_value,
    _lookup_cik,
)

router = APIRouter(prefix="/demo", tags=["demo"])

_AMZN_TICKER = "AMZN"
_AMZN_NAME = "Amazon.com, Inc."
_AMZN_SECTOR = "Technology / Consumer Internet"
_AMZN_THESIS = (
    "Amazon will continue strengthening because AWS and AI infrastructure "
    "demand remain strong."
)


def _get_or_create_amzn_demo(db) -> tuple[dict, dict]:
    """
    Return (company, thesis) for the AMZN demo, creating either if missing.

    Shared by both /seed-amzn and /run-amzn so the idempotent logic lives
    in one place.
    """
    # ── Company ──────────────────────────────────────────────────────────────
    company_result = (
        db.table("companies").select("*").eq("ticker", _AMZN_TICKER).execute()
    )
    if company_result.data:
        company = company_result.data[0]
    else:
        company = (
            db.table("companies")
            .insert({
                "ticker": _AMZN_TICKER,
                "name": _AMZN_NAME,
                "sector": _AMZN_SECTOR,
            })
            .execute()
            .data[0]
        )

    # ── Thesis ───────────────────────────────────────────────────────────────
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
        thesis = (
            db.table("theses")
            .insert({
                "company_ticker": _AMZN_TICKER,
                "thesis_text": _AMZN_THESIS,
            })
            .execute()
            .data[0]
        )

    return company, thesis


@router.post("/seed-amzn")
def seed_amzn() -> dict:
    """
    Idempotent demo seed endpoint.

    Creates the AMZN company and demo thesis if they do not already exist.
    Safe to call multiple times.
    """
    try:
        db = get_supabase()
        company, thesis = _get_or_create_amzn_demo(db)
        return {
            "company": company,
            "thesis": thesis,
            "message": "AMZN demo data is ready.",
        }
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/run-amzn")
def run_amzn() -> dict:
    """
    Full AMZN demo run.

    1. Creates or reuses the AMZN company and demo thesis.
    2. Imports SEC financial evidence (skips duplicates if already imported).
    3. Generates a rule-based drift verdict.

    Safe to call multiple times — SEC evidence is deduplicated and a fresh
    verdict is recorded on each run.
    """
    try:
        db = get_supabase()

        # ── Step 1: seed company + thesis ────────────────────────────────────
        company, thesis = _get_or_create_amzn_demo(db)
        thesis_id = thesis["id"]

        # ── Step 2: import SEC financial evidence ────────────────────────────
        sec_company = _lookup_cik(_AMZN_TICKER)
        facts = _fetch_company_facts(sec_company["cik"], sec_company["ticker"])
        us_gaap: dict = facts.get("facts", {}).get("us-gaap", {})

        existing_titles = _existing_sec_titles(db, thesis_id)
        sec_source_url = SEC_FACTS_URL.format(cik=sec_company["cik"])

        rows_to_insert = []
        skipped = 0

        for concept_name in _SUMMARY_CONCEPTS:
            concept_data = us_gaap.get(concept_name)
            if concept_data is None:
                continue
            latest = _latest_annual_value(concept_data)
            if latest is None:
                continue

            label = concept_data.get("label", concept_name)
            fy = latest["fiscal_year"]
            source_title = f"{sec_company['company_name']} {label} FY{fy}"

            if source_title in existing_titles:
                skipped += 1
                continue

            value = latest["value"]
            form = latest["form"]
            filed = latest["filed"]

            rows_to_insert.append({
                "thesis_id": thesis_id,
                "company_ticker": _AMZN_TICKER,
                "source_type": "sec_financial_fact",
                "source_title": source_title,
                "source_url": sec_source_url,
                "evidence_text": (
                    f"{sec_company['company_name']} reported {label} of "
                    f"{value:,.0f} USD for FY{fy} in its {form} filed on {filed}."
                ),
                "stance": "neutral",
            })

        if rows_to_insert:
            db.table("evidence").insert(rows_to_insert).execute()

        evidence_import = {
            "created_evidence_count": len(rows_to_insert),
            "skipped_duplicate_count": skipped,
        }

        # ── Step 3: generate drift verdict ───────────────────────────────────
        all_evidence = (
            db.table("evidence").select("*").eq("thesis_id", thesis_id).execute()
        )
        verdict, confidence, rationale = _compute_verdict(all_evidence.data)

        verdict_row = (
            db.table("drift_verdicts")
            .insert({
                "thesis_id": thesis_id,
                "company_ticker": _AMZN_TICKER,
                "verdict": verdict,
                "confidence": round(confidence, 4),
                "rationale": rationale,
            })
            .execute()
            .data[0]
        )

        return {
            "message": "AMZN demo run complete.",
            "company": company,
            "thesis": thesis,
            "evidence_import": evidence_import,
            "verdict": verdict_row,
        }

    except HTTPException:
        raise
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
