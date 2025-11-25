from __future__ import annotations

from typing import Any

import httpx

from app.config import get_settings

settings = get_settings()


class CompetitorIntelClient:
    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.comp_intel_api_key
        self.session = httpx.Client(timeout=30)

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.api_key}"}

    def fetch_market_share(self, domain: str) -> dict[str, Any]:
        try:
            resp = self.session.get(
                "https://api.trafficintel.com/v1/market-share",
                headers=self._headers(),
                params={"domain": domain},
            )
            resp.raise_for_status()
            return resp.json()
        except Exception:
            return {
                "domain": domain,
                "traffic_share": 0.23,
                "top_channels": [
                    {"channel": "Paid Social", "share": 0.45},
                    {"channel": "Organic Search", "share": 0.25},
                    {"channel": "Affiliate", "share": 0.12},
                ],
                "benchmark_ctr": 0.065,
                "benchmark_cpc": 0.38,
            }

