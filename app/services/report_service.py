from __future__ import annotations

from pathlib import Path
from typing import Any

import pendulum
from sqlmodel import Session

from app.config import get_settings
from app.models.report import ReportRun
from app.schemas.reports import InsightPayload, ReportSummary
from app.services.cache_service import CacheService
from app.services.competitor_client import CompetitorIntelClient
from app.services.insight_service import InsightService
from app.services.meta_client import MetaAdsClient

settings = get_settings()


class ReportService:
    def __init__(self) -> None:
        self.meta_client = MetaAdsClient()
        self.competitor_client = CompetitorIntelClient()
        self.insight_service = InsightService()
        self.cache = CacheService()
        self.bucket = Path(settings.report_bucket_path)
        self.bucket.mkdir(parents=True, exist_ok=True)

    def build_cache_key(self, account_id: str) -> str:
        current_hour = pendulum.now("UTC").format("YYYYMMDDHH")
        return f"report:{account_id}:{current_hour}"

    def fetch_data(self, account_id: str, domain: str) -> tuple[dict[str, Any], dict[str, Any]]:
        meta = self.meta_client.fetch_account_overview(account_id)
        competitor = self.competitor_client.fetch_market_share(domain)
        return meta, competitor

    def generate_report(
        self,
        db: Session,
        *,
        account_id: str,
        domain: str,
        timeframe: str,
    ) -> ReportRun:
        meta, competitor = self.fetch_data(account_id, domain)
        insight = self.insight_service.generate(meta, competitor)
        artifact_path = self.persist_artifact(account_id, insight["text"])

        run = ReportRun(
            account_id=account_id,
            timeframe=timeframe,
            meta_payload=meta,
            competitor_payload=competitor,
            insight_text=insight["text"],
            insight_metadata={"provider": insight["provider"]},
            artifacts_path=artifact_path,
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        cache_key = self.build_cache_key(account_id)
        self.cache.set_snapshot(
            cache_key,
            {
                "account_id": account_id,
                "timeframe": timeframe,
                "meta": meta,
                "competitor": competitor,
                "insight": insight,
                "artifacts_path": artifact_path,
                "created_at": run.created_at.isoformat(),
            },
        )
        return run

    def persist_artifact(self, account_id: str, content: str) -> str:
        filename = self.bucket / f"{account_id}-{pendulum.now('UTC').int_timestamp}.md"
        filename.write_text(content)
        return str(filename)

    def transform_run_to_summary(self, run: ReportRun) -> ReportSummary:
        insight = InsightPayload(
            summary=run.insight_text.split("\n\n")[0],
            recommendations=run.insight_text.split("\n"),
            anomalies=run.insight_metadata.get("anomalies", []),
            llm_provider=run.insight_metadata.get("provider", "claude"),
        )
        return ReportSummary(
            account_id=run.account_id,
            timeframe=run.timeframe,
            meta=run.meta_payload,
            competitor=run.competitor_payload,
            insight=insight,
            artifacts_path=run.artifacts_path,
            created_at=run.created_at,
        )

