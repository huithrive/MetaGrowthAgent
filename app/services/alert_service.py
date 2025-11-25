from __future__ import annotations

import json
from typing import Any

import httpx
from sqlmodel import Session

from app.config import get_settings
from app.models.report import AlertEvent

settings = get_settings()


class AlertService:
    def __init__(self) -> None:
        self.webhook_url = settings.alert_webhook_url

    def persist_alert(self, db: Session, payload: dict[str, Any]) -> AlertEvent:
        alert = AlertEvent(**payload)
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    def send_webhook(self, alert: AlertEvent) -> None:
        if not self.webhook_url:
            return
        body = {
            "text": f"[{alert.severity}] {alert.alert_type} for {alert.account_id}",
            "details": alert.message,
            "metadata": alert.metadata,
        }
        try:
            httpx.post(self.webhook_url, data=json.dumps(body), headers={"Content-Type": "application/json"})
        except Exception:
            # Avoid crashing worker if Slack/webhook is down.
            pass

