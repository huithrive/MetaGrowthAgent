from datetime import datetime
from typing import Any, Optional

from sqlmodel import Field, SQLModel


class ReportRun(SQLModel, table=True):
    __tablename__ = "report_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: str
    timeframe: str
    meta_payload: dict[str, Any]
    competitor_payload: dict[str, Any]
    insight_text: str
    insight_metadata: dict
    artifacts_path: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AlertEvent(SQLModel, table=True):
    __tablename__ = "alert_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: str
    alert_type: str
    severity: str
    message: str
    metadata: dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)

