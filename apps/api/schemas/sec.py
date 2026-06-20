from pydantic import BaseModel, Field


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


class FinancialFact(BaseModel):
    fact_name: str
    label: str
    unit: str
    value: float
    fiscal_year: int
    fiscal_period: str
    form: str
    filed: str


class SECFinancialSummaryResponse(BaseModel):
    ticker: str
    cik: str
    company_name: str
    financial_facts: list[FinancialFact]


class SECFinancialEvidenceResponse(BaseModel):
    ticker: str
    thesis_id: str
    created_evidence_count: int
    skipped_duplicate_count: int
    created_evidence: list[dict]


class SECFiling(BaseModel):
    form: str
    accession_number: str
    filing_date: str
    report_date: str | None
    primary_document: str
    document_url: str


class SECFilingsResponse(BaseModel):
    ticker: str
    cik: str
    filings: list[SECFiling] = Field(default_factory=list)
