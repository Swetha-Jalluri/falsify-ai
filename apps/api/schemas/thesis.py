from pydantic import BaseModel


class ThesisCreate(BaseModel):
    company_ticker: str
    thesis_text: str


class ThesisResponse(BaseModel):
    id: str
    company_ticker: str
    thesis_text: str
    status: str
