from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.routes import access_requests, audit_logs, consent, health, records, summaries

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event() -> None:
    init_db()


app.include_router(health.router, prefix=settings.api_v1_prefix, tags=["health"])
app.include_router(access_requests.router, prefix=settings.api_v1_prefix, tags=["access-requests"])
app.include_router(consent.router, prefix=settings.api_v1_prefix, tags=["consent"])
app.include_router(records.router, prefix=settings.api_v1_prefix, tags=["records"])
app.include_router(summaries.router, prefix=settings.api_v1_prefix, tags=["summaries"])
app.include_router(audit_logs.router, prefix=settings.api_v1_prefix, tags=["audit-logs"])
