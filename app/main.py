from fastapi import FastAPI

from app.config import get_settings
from app.db import init_db
from app.logging_config import configure_logging
from app.routers import api_router

configure_logging()
settings = get_settings()

app = FastAPI(
    title="Meta Growth Agent",
    version="0.1.0",
    description="Backend agent for Meta Ads diagnostics and competitor intelligence.",
)
app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    init_db()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}

