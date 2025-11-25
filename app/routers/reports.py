from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.dependencies import get_db_session
from app.models.report import ReportRun
from app.schemas.reports import RefreshRequest, ReportResponse, ReportSummary
from app.services.report_service import ReportService
from app.tasks.refresh import enqueue_refresh

router = APIRouter()
service = ReportService()


@router.get("/{account_id}", response_model=ReportResponse)
async def get_report(account_id: str, db: Session = Depends(get_db_session)) -> ReportResponse:
    statement = select(ReportRun).where(ReportRun.account_id == account_id).order_by(ReportRun.id.desc())
    report = db.exec(statement).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    summary = service.transform_run_to_summary(report)
    return ReportResponse(report=summary)


@router.post("/{account_id}/refresh", status_code=202)
async def refresh_report(account_id: str, payload: RefreshRequest) -> dict[str, str]:
    enqueue_refresh(account_id=account_id, priority=payload.priority)
    return {"status": "scheduled"}

