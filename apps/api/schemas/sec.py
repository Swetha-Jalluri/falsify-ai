from pydantic import BaseModel


class SECCompanyResponse(BaseModel):
    ticker: str
    cik: str
    company_name: str


class SECCompanyFactsResponse(BaseModel):
    ticker: str
    cik: str
    company_name: str
    facts_available: bool
    available_taxonomies: list[str]
    sample_us_gaap_facts: list[str]
