from datetime import datetime
from typing import Any

from pydantic import BaseModel


class AlertResponse(BaseModel):
    id: int
    account_id: str
    alert_type: str
    severity: str
    message: str
    metadata: dict[str, Any]
    created_at: datetime

