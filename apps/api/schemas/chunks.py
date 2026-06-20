from pydantic import BaseModel, Field, field_validator


class DocumentChunk(BaseModel):
    ticker: str
    cik: str
    filing_type: str
    filing_date: str | None = None
    source_url: str | None = None
    chunk_index: int = Field(..., ge=0)
    chunk_text: str
    metadata: dict = Field(default_factory=dict)

    @field_validator("chunk_text")
    @classmethod
    def chunk_text_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("chunk_text must not be empty or whitespace.")
        return v


class ChunkPreviewResponse(BaseModel):
    ticker: str
    filing_type: str
    total_chunks: int
    chunks: list[DocumentChunk]
