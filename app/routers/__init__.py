from fastapi import APIRouter

from app.routers import reports, alerts, auth, workflow, traffic, voice

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(workflow.router, prefix="/workflow", tags=["workflow"])
api_router.include_router(traffic.router, prefix="/traffic", tags=["traffic"])
api_router.include_router(voice.router, prefix="/voice", tags=["voice"])

