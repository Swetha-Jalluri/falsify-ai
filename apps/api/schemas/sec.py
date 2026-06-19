from pydantic import BaseModel


class SECCompanyResponse(BaseModel):
    ticker: str
    cik: str
    company_name: str
