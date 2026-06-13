from pydantic import BaseModel


# Allowed values for the verdict field
VERDICT_VALUES = {"supported", "weakening", "contradicted", "needs_more_evidence"}


class DriftVerdictCreate(BaseModel):
    thesis_id: str
    company_ticker: str
    verdict: str
    confidence: float
    rationale: str


class DriftVerdictResponse(BaseModel):
    id: str
    thesis_id: str
    company_ticker: str
    verdict: str
    confidence: float
    rationale: str
    created_at: str
