from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class InsightPayload(BaseModel):
    summary: str
    recommendations: list[str] = Field(default_factory=list)
    anomalies: list[dict[str, Any]] = Field(default_factory=list)
    llm_provider: str


class ReportSummary(BaseModel):
    account_id: str
    timeframe: str
    meta: dict[str, Any]
    competitor: dict[str, Any]
    insight: InsightPayload
    artifacts_path: Optional[str] = None
    created_at: datetime


class ReportResponse(BaseModel):
    report: ReportSummary


class RefreshRequest(BaseModel):
    priority: bool = False

