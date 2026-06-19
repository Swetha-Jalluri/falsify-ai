import os

import httpx
from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.sec import (
    SECCompanyFactsResponse,
    SECCompanyResponse,
    SECFinancialEvidenceResponse,
    SECFinancialSummaryResponse,
)

router = APIRouter(prefix="/sec", tags=["sec"])

SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SEC_FACTS_URL = "https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"

# SEC requires a descriptive User-Agent for all API requests.
# Set SEC_USER_AGENT in your .env file, e.g.:
#   SEC_USER_AGENT=YourName yourname@email.com
_DEFAULT_USER_AGENT = "falsify-dev contact@example.com"

# us-gaap concepts to extract for the financial summary.
# Listed in priority order; the first available concept for each category is used.
_SUMMARY_CONCEPTS = [
    "Revenues",
    "RevenueFromContractWithCustomerExcludingAssessedTax",
    "NetIncomeLoss",
    "OperatingIncomeLoss",
    "Assets",
    "Liabilities",
    "CashAndCashEquivalentsAtCarryingValue",
    "NetCashProvidedByUsedInOperatingActivities",
]


def _get_user_agent() -> str:
    return os.getenv("SEC_USER_AGENT", _DEFAULT_USER_AGENT)


def _lookup_cik(ticker: str) -> dict:
    """
    Fetch the SEC company tickers registry and return the matching entry.

    Returns a dict with keys: ticker (normalized), cik (zero-padded), company_name.
    Raises HTTPException 404 if the ticker is not found, 502 if the SEC request fails.
    """
    normalized = ticker.strip().upper()

    try:
        response = httpx.get(
            SEC_TICKERS_URL,
            headers={"User-Agent": _get_user_agent()},
            timeout=10.0,
            follow_redirects=True,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch SEC company tickers: {exc}",
        )

    # The SEC returns a dict of numeric keys → {cik_str, ticker, title}
    companies: dict = response.json()

    for entry in companies.values():
        if entry.get("ticker", "").upper() == normalized:
            # CIK is returned as an integer; zero-pad to 10 digits per SEC convention
            cik_padded = str(entry["cik_str"]).zfill(10)
            return {
                "ticker": normalized,
                "cik": cik_padded,
                "company_name": entry["title"],
            }

    raise HTTPException(
        status_code=404,
        detail=f"Ticker '{normalized}' not found in SEC company registry.",
    )


def _fetch_company_facts(cik: str, ticker: str) -> dict:
    """
    Fetch the full SEC XBRL facts payload for a given CIK.

    Returns the parsed JSON dict.
    Raises HTTPException 404 if facts are missing, 502 if the request fails.
    """
    facts_url = SEC_FACTS_URL.format(cik=cik)

    try:
        response = httpx.get(
            facts_url,
            headers={"User-Agent": _get_user_agent()},
            timeout=15.0,
            follow_redirects=True,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"No SEC facts found for CIK '{cik}' ({ticker}).",
            )
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch SEC company facts: {exc}",
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch SEC company facts: {exc}",
        )

    return response.json()


def _latest_annual_value(concept_data: dict) -> dict | None:
    """
    Extract the latest annual 10-K value from a single us-gaap concept.

    The SEC facts payload stores each concept as a dict with a 'units' key
    containing lists of filings. We look for USD-denominated 10-K entries,
    then fall back to any entry if no 10-K is available.

    Returns a dict with value, fiscal_year, fiscal_period, form, and filed,
    or None if no usable data is found.
    """
    units: dict = concept_data.get("units", {})

    # Most financial facts are denominated in USD
    entries: list[dict] = units.get("USD", [])
    if not entries:
        return None

    # Prefer 10-K annual filings; fall back to the most recently filed entry
    annual = [e for e in entries if e.get("form") == "10-K" and e.get("fp") == "FY"]
    candidates = annual if annual else entries

    # Pick the entry with the latest filed date
    latest = max(candidates, key=lambda e: e.get("filed", ""), default=None)
    if latest is None:
        return None

    return {
        "value": latest["val"],
        "fiscal_year": latest.get("fy", 0),
        "fiscal_period": latest.get("fp", ""),
        "form": latest.get("form", ""),
        "filed": latest.get("filed", ""),
    }


@router.get("/company/{ticker}", response_model=SECCompanyResponse)
def get_sec_company(ticker: str) -> dict:
    """Look up a company's SEC CIK number and name by ticker symbol."""
    return _lookup_cik(ticker)


@router.get("/company/{ticker}/facts", response_model=SECCompanyFactsResponse)
def get_sec_company_facts(ticker: str) -> dict:
    """
    Return a summary of SEC XBRL company facts for a given ticker.

    Fetches the full SEC facts payload but returns only a lightweight
    summary — available taxonomies and up to 20 sample us-gaap concept names.
    """
    company = _lookup_cik(ticker)
    facts = _fetch_company_facts(company["cik"], company["ticker"])
    facts_data: dict = facts.get("facts", {})

    return {
        "ticker": company["ticker"],
        "cik": company["cik"],
        "company_name": company["company_name"],
        "facts_available": bool(facts_data),
        "available_taxonomies": list(facts_data.keys()),
        "sample_us_gaap_facts": list(facts_data.get("us-gaap", {}).keys())[:20],
    }


@router.get("/company/{ticker}/financial-summary", response_model=SECFinancialSummaryResponse)
def get_sec_financial_summary(ticker: str) -> dict:
    """
    Return a small set of key financial facts for a given ticker.

    Extracts the latest annual 10-K value for each concept in _SUMMARY_CONCEPTS.
    Falls back to the most recently filed value if no 10-K entry is available.
    """
    company = _lookup_cik(ticker)
    facts = _fetch_company_facts(company["cik"], company["ticker"])
    us_gaap: dict = facts.get("facts", {}).get("us-gaap", {})

    financial_facts = []

    for concept_name in _SUMMARY_CONCEPTS:
        concept_data = us_gaap.get(concept_name)
        if concept_data is None:
            continue

        latest = _latest_annual_value(concept_data)
        if latest is None:
            continue

        financial_facts.append({
            "fact_name": concept_name,
            "label": concept_data.get("label", concept_name),
            "unit": "USD",
            "value": latest["value"],
            "fiscal_year": latest["fiscal_year"],
            "fiscal_period": latest["fiscal_period"],
            "form": latest["form"],
            "filed": latest["filed"],
        })

    if not financial_facts:
        raise HTTPException(
            status_code=404,
            detail=f"No useful financial facts found for '{company['ticker']}'.",
        )

    return {
        "ticker": company["ticker"],
        "cik": company["cik"],
        "company_name": company["company_name"],
        "financial_facts": financial_facts,
    }


def _existing_sec_titles(db, thesis_id: str) -> set[str]:
    """
    Return the set of source_title values already stored for this thesis
    with source_type 'sec_financial_fact'.

    Used to skip rows that have already been imported.
    """
    result = (
        db.table("evidence")
        .select("source_title")
        .eq("thesis_id", thesis_id)
        .eq("source_type", "sec_financial_fact")
        .execute()
    )
    return {row["source_title"] for row in result.data}


@router.post(
    "/company/{ticker}/financial-evidence/{thesis_id}",
    response_model=SECFinancialEvidenceResponse,
    status_code=201,
)
def create_financial_evidence(ticker: str, thesis_id: str) -> dict:
    """
    Fetch SEC financial facts for a ticker and insert them as evidence rows
    linked to the given thesis in Supabase.

    Each financial fact becomes one evidence row with stance 'neutral'.
    The thesis must already exist in the theses table.
    """
    db = get_supabase()

    # Verify the thesis exists before doing any SEC work
    try:
        thesis_result = (
            db.table("theses").select("id").eq("id", thesis_id).execute()
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    if not thesis_result.data:
        raise HTTPException(
            status_code=404,
            detail=f"No thesis found with id '{thesis_id}'.",
        )

    # Fetch financial summary — reuses existing helpers and error handling
    company = _lookup_cik(ticker)
    facts = _fetch_company_facts(company["cik"], company["ticker"])
    us_gaap: dict = facts.get("facts", {}).get("us-gaap", {})

    financial_facts = []
    for concept_name in _SUMMARY_CONCEPTS:
        concept_data = us_gaap.get(concept_name)
        if concept_data is None:
            continue
        latest = _latest_annual_value(concept_data)
        if latest is None:
            continue
        financial_facts.append({
            "fact_name": concept_name,
            "label": concept_data.get("label", concept_name),
            "latest": latest,
        })

    if not financial_facts:
        raise HTTPException(
            status_code=404,
            detail=f"No useful financial facts found for '{company['ticker']}'.",
        )

    sec_source_url = SEC_FACTS_URL.format(cik=company["cik"])

    # Fetch titles already stored so we can skip duplicates
    try:
        existing_titles = _existing_sec_titles(db, thesis_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    rows_to_insert = []
    skipped = 0

    for fact in financial_facts:
        label = fact["label"]
        latest = fact["latest"]
        fy = latest["fiscal_year"]
        value = latest["value"]
        form = latest["form"]
        filed = latest["filed"]

        source_title = f"{company['company_name']} {label} FY{fy}"

        if source_title in existing_titles:
            skipped += 1
            continue

        evidence_text = (
            f"{company['company_name']} reported {label} of {value:,.0f} USD "
            f"for FY{fy} in its {form} filed on {filed}."
        )

        rows_to_insert.append({
            "thesis_id": thesis_id,
            "company_ticker": company["ticker"],
            "source_type": "sec_financial_fact",
            "source_title": source_title,
            "source_url": sec_source_url,
            "evidence_text": evidence_text,
            "stance": "neutral",
        })

    if not rows_to_insert:
        return {
            "ticker": company["ticker"],
            "thesis_id": thesis_id,
            "created_evidence_count": 0,
            "skipped_duplicate_count": skipped,
            "created_evidence": [],
        }

    try:
        insert_result = db.table("evidence").insert(rows_to_insert).execute()
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "ticker": company["ticker"],
        "thesis_id": thesis_id,
        "created_evidence_count": len(insert_result.data),
        "skipped_duplicate_count": skipped,
        "created_evidence": insert_result.data,
    }
