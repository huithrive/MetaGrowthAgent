from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.dependencies import get_db_session
from app.models.report import AlertEvent
from app.schemas.alerts import AlertResponse

router = APIRouter()


@router.get("/", response_model=List[AlertResponse])
async def list_alerts(db: Session = Depends(get_db_session)) -> list[AlertResponse]:
    statement = select(AlertEvent).order_by(AlertEvent.created_at.desc()).limit(50)
    results = db.exec(statement).all()
    return [AlertResponse(**alert.model_dump()) for alert in results]

