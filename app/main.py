from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite default dev server
        "http://localhost:3000",   # Alternative dev port
        "http://localhost:8080",   # Alternative dev port
        "*"  # Allow all origins in development (restrict in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def startup_event() -> None:
    init_db()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.environment}

