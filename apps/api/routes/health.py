import os

from fastapi import APIRouter

from schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        app_name="Falsify API",
        version="0.1.0",
        environment=os.getenv("APP_ENV", "development"),
    )
