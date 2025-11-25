from __future__ import annotations

import structlog
from celery import shared_task

from app.db import get_session
from app.services.report_service import ReportService

logger = structlog.get_logger()
report_service = ReportService()


@shared_task(name="refresh_account_task")
def refresh_account_task(account_id: str, domain: str = "example.com", timeframe: str = "last_7d") -> str:
    try:
        with get_session() as session:
            run = report_service.generate_report(
                session,
                account_id=account_id,
                domain=domain,
                timeframe=timeframe,
            )
        logger.info("refresh.completed", account_id=account_id, report_id=run.id)
        return "ok"
    except Exception as exc:  # noqa: BLE001
        logger.error("refresh.failed", account_id=account_id, error=str(exc))
        raise


def enqueue_refresh(account_id: str, priority: bool = False) -> None:
    queue = "priority" if priority else "default"
    refresh_account_task.apply_async(kwargs={"account_id": account_id}, queue=queue)

