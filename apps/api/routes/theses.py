import uuid

from fastapi import APIRouter

from schemas.thesis import ThesisCreate, ThesisResponse

router = APIRouter(prefix="/theses", tags=["theses"])

_theses: list[dict] = []


@router.get("", response_model=list[ThesisResponse])
def list_theses() -> list[dict]:
    return _theses


@router.post("", response_model=ThesisResponse, status_code=201)
def create_thesis(body: ThesisCreate) -> dict:
    thesis = {
        "id": str(uuid.uuid4()),
        "company_ticker": body.company_ticker,
        "thesis_text": body.thesis_text,
        "status": "active",
    }
    _theses.append(thesis)
    return thesis
