from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.analyzer import router as analyzer_router
from routes.companies import router as companies_router
from routes.demo import router as demo_router
from routes.drift_verdicts import router as drift_verdicts_router
from routes.evidence import router as evidence_router
from routes.health import router as health_router
from routes.sec import router as sec_router
from routes.theses import router as theses_router

load_dotenv()

app = FastAPI(title="Falsify API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(companies_router)
app.include_router(theses_router)
app.include_router(evidence_router)
app.include_router(drift_verdicts_router)
app.include_router(analyzer_router)
app.include_router(sec_router)
app.include_router(demo_router)
