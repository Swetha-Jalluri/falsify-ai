from fastapi import APIRouter, HTTPException

from db.supabase_client import get_supabase
from schemas.company import CompanyCreate, CompanyResponse

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("", response_model=list[CompanyResponse])
def list_companies() -> list[dict]:
    try:
        result = get_supabase().table("companies").select("*").execute()
        return result.data
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("", response_model=CompanyResponse, status_code=201)
def create_company(body: CompanyCreate) -> dict:
    try:
        result = (
            get_supabase()
            .table("companies")
            .insert({"ticker": body.ticker, "name": body.name, "sector": body.sector})
            .execute()
        )
        return result.data[0]
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
