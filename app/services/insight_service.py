from __future__ import annotations

from typing import Any

import anthropic
import google.generativeai as genai
from jinja2 import Template

from app.config import get_settings

settings = get_settings()

INSIGHT_TEMPLATE = Template(
    """You are an e-commerce growth strategist.
Meta performance:
{{ meta|tojson }}

Competitor intelligence:
{{ competitor|tojson }}

Write:
1. 3 bullet insight summary
2. Top optimizations for Meta Ads to raise ROAS
3. Defensive moves vs competitors
Keep tone actionable.
"""
)


class InsightService:
    def __init__(self) -> None:
        self._anthropic = anthropic.Anthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self._gemini = genai.GenerativeModel("gemini-1.5-pro")
        else:
            self._gemini = None

    def render_prompt(self, meta: dict[str, Any], competitor: dict[str, Any]) -> str:
        return INSIGHT_TEMPLATE.render(meta=meta, competitor=competitor)

    def generate(self, meta: dict[str, Any], competitor: dict[str, Any]) -> dict[str, Any]:
        prompt = self.render_prompt(meta, competitor)
        provider = settings.llm_provider.lower()
        if provider == "claude" and self._anthropic:
            message = self._anthropic.messages.create(
                model="claude-3-5-sonnet-20240620",
                max_tokens=800,
                messages=[{"role": "user", "content": prompt}],
            )
            text = message.content[0].text if message.content else ""
        elif provider == "gemini" and self._gemini:
            resp = self._gemini.generate_content(prompt)
            text = resp.text or ""
        else:
            text = (
                "Summary:\n- Spend stable, ROAS above benchmark.\n"
                "- Competitors leaning heavier into paid social.\n"
                "- Opportunity to scale top audiences.\n\n"
                "Optimizations:\n1. Increase budget on high-ROAS ad sets by 20%.\n"
                "2. Launch Advantage+ shopping targeting lookalike 2%.\n"
                "3. Refresh creative around UGC hooks emphasizing price advantage.\n\n"
                "Defensive Moves:\n- Monitor CompetitorA's CPC trend weekly.\n"
                "- Capture organic terms they dominate via content partnerships.\n"
                "- Build affiliate promos to counter their influencer push.\n"
            )
        return {"text": text, "provider": provider}

