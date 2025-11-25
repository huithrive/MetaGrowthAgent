"""Traffic analysis router using RapidAPI."""
from fastapi import APIRouter, HTTPException, status
from typing import Any

from app.services.traffic_service import TrafficAnalysisService

router = APIRouter()
traffic_service = TrafficAnalysisService()


@router.get("/{domain}")
async def get_traffic(domain: str) -> dict[str, Any]:
    """Get traffic data for a domain using RapidAPI."""
    try:
        data = await traffic_service.get_traffic_data(domain)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch traffic data: {str(e)}"
        )


@router.post("/batch")
async def get_traffic_batch(domains: list[str]) -> dict[str, dict[str, Any]]:
    """Get traffic data for multiple domains."""
    try:
        data = await traffic_service.get_multiple_domains(domains)
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch traffic data: {str(e)}"
        )

