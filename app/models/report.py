from datetime import datetime
from typing import Any, Optional

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


class ReportRun(SQLModel, table=True):
    __tablename__ = "report_runs"

    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: str
    timeframe: str
    meta_payload: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    competitor_payload: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    insight_text: str
    insight_metadata: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    artifacts_path: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AlertEvent(SQLModel, table=True):
    __tablename__ = "alert_events"

    id: Optional[int] = Field(default=None, primary_key=True)
    account_id: str
    alert_type: str
    severity: str
    message: str
    metadata: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=datetime.utcnow)

