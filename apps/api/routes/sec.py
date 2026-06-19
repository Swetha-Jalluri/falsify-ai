import os

import httpx
from fastapi import APIRouter, HTTPException

from schemas.sec import SECCompanyFactsResponse, SECCompanyResponse

router = APIRouter(prefix="/sec", tags=["sec"])

SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
SEC_FACTS_URL = "https://data.sec.gov/api/xbrl/companyfacts/CIK{cik}.json"

# SEC requires a descriptive User-Agent for all API requests.
# Set SEC_USER_AGENT in your .env file, e.g.:
#   SEC_USER_AGENT=YourName yourname@email.com
_DEFAULT_USER_AGENT = "falsify-dev contact@example.com"


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

    facts_url = SEC_FACTS_URL.format(cik=company["cik"])

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
                detail=f"No SEC facts found for CIK '{company['cik']}' ({company['ticker']}).",
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

    facts: dict = response.json()
    facts_data: dict = facts.get("facts", {})

    available_taxonomies = list(facts_data.keys())

    # Return up to 20 us-gaap concept names as a sample
    us_gaap_facts: list[str] = list(facts_data.get("us-gaap", {}).keys())[:20]

    return {
        "ticker": company["ticker"],
        "cik": company["cik"],
        "company_name": company["company_name"],
        "facts_available": bool(facts_data),
        "available_taxonomies": available_taxonomies,
        "sample_us_gaap_facts": us_gaap_facts,
    }
