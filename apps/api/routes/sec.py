import os

import httpx
from fastapi import APIRouter, HTTPException

from schemas.sec import SECCompanyResponse

router = APIRouter(prefix="/sec", tags=["sec"])

SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"

# SEC requires a descriptive User-Agent for all API requests.
# Set SEC_USER_AGENT in your .env file, e.g.:
#   SEC_USER_AGENT=YourName yourname@email.com
_DEFAULT_USER_AGENT = "falsify-dev contact@example.com"


def _get_user_agent() -> str:
    return os.getenv("SEC_USER_AGENT", _DEFAULT_USER_AGENT)


@router.get("/company/{ticker}", response_model=SECCompanyResponse)
def get_sec_company(ticker: str) -> dict:
    """
    Look up a company's SEC CIK number by ticker symbol.

    Fetches the SEC's public company tickers registry and returns
    the matching CIK and company name for the given ticker.
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
