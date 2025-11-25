"""Schemas for workflow configuration."""
from typing import Any

from pydantic import BaseModel, Field

from app.services.workflow_service import WorkflowTask


class WorkflowConfigRequest(BaseModel):
    """Request to configure workflow AI providers."""
    config: dict[str, str] = Field(
        default_factory=dict,
        description="Mapping of task names to AI provider names (claude, gemini)"
    )


class WorkflowExecutionRequest(BaseModel):
    """Request to execute a workflow."""
    domain: str
    meta_data: dict[str, Any] = Field(default_factory=dict)
    competitor_data: dict[str, Any] = Field(default_factory=dict)
    custom_config: dict[str, str] | None = Field(
        None,
        description="Optional custom AI provider configuration for this execution"
    )


class WorkflowResponse(BaseModel):
    """Response from workflow execution."""
    domain: str
    executive_summary: str
    competitors: str
    traffic_analysis: str = ""
    market_gap: str
    growth_opportunities: str
    meta_diagnostic: str
    recommendations: str
    traffic_data: dict[str, Any] = Field(default_factory=dict)
    workflow_metadata: dict[str, dict[str, str]]


class TaskExecutionRequest(BaseModel):
    """Request to execute a single task."""
    task: str = Field(description="Task name from WorkflowTask enum")
    prompt: str
    provider: str | None = Field(None, description="Override default provider")
    model: str | None = Field(None, description="Specific model to use")


class TaskExecutionResponse(BaseModel):
    """Response from single task execution."""
    content: str
    provider: str
    model: str
    metadata: dict[str, Any] = Field(default_factory=dict)

