import uuid

from fastapi import APIRouter, HTTPException

from schemas.company import CompanyCreate, CompanyResponse

router = APIRouter(prefix="/companies", tags=["companies"])

_companies: list[dict] = []


@router.get("", response_model=list[CompanyResponse])
def list_companies() -> list[dict]:
    return _companies


@router.post("", response_model=CompanyResponse, status_code=201)
def create_company(body: CompanyCreate) -> dict:
    company = {
        "id": str(uuid.uuid4()),
        "ticker": body.ticker,
        "name": body.name,
        "sector": body.sector,
    }
    _companies.append(company)
    return company
