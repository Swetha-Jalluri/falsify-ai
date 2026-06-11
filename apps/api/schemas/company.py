from pydantic import BaseModel


class CompanyCreate(BaseModel):
    ticker: str
    name: str
    sector: str


class CompanyResponse(BaseModel):
    id: str
    ticker: str
    name: str
    sector: str
