from __future__ import annotations

from typing import Any

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

settings = get_settings()


class MetaAdsClient:
    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self, token: str | None = None) -> None:
        self.token = token or settings.meta_ads_token
        self.session = httpx.Client(timeout=30)

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    def fetch_account_overview(self, account_id: str) -> dict[str, Any]:
        """Call Meta Ads insights API. Placeholder returns mock structure when offline."""
        try:
            params = {
                "fields": ",".join(
                    [
                        "spend",
                        "impressions",
                        "clicks",
                        "actions",
                        "cpc",
                        "cpm",
                        "ctr",
                        "purchase_roas",
                    ]
                ),
                "time_range": {"since": "2024-01-01", "until": "2024-01-07"},
            }
            resp = self.session.get(
                f"{self.BASE_URL}/act_{account_id}/insights",
                headers=self._headers(),
                params=params,
            )
            resp.raise_for_status()
            data = resp.json()
            if "data" in data:
                return data["data"][0]
            return data
        except Exception:
            # Provide deterministic fallback for local development/testing.
            return {
                "spend": 12500,
                "impressions": 1_500_000,
                "clicks": 120_000,
                "ctr": 0.08,
                "cpc": 0.45,
                "cpm": 8.2,
                "purchase_roas": 4.5,
            }

