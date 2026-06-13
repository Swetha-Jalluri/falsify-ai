from pydantic import BaseModel


class EvidenceCreate(BaseModel):
    thesis_id: str
    company_ticker: str
    source_type: str
    source_title: str
    source_url: str
    evidence_text: str
    stance: str


class EvidenceResponse(BaseModel):
    id: str
    thesis_id: str
    company_ticker: str
    source_type: str
    source_title: str
    source_url: str
    evidence_text: str
    stance: str
    created_at: str
