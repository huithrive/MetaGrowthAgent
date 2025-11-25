"""Workflow router for AI-powered market research workflows."""
from fastapi import APIRouter, HTTPException, status

from app.schemas.workflow import (
    TaskExecutionRequest,
    TaskExecutionResponse,
    WorkflowConfigRequest,
    WorkflowExecutionRequest,
    WorkflowResponse,
)
from app.services.ai_providers import AIProviderFactory
from app.services.workflow_service import WorkflowService, WorkflowTask

router = APIRouter()
workflow_service = WorkflowService()


@router.get("/providers")
async def list_providers() -> dict[str, list[str]]:
    """List available AI providers."""
    return {"available": AIProviderFactory.list_available_providers()}


@router.get("/tasks")
async def list_tasks() -> dict[str, list[str]]:
    """List available workflow tasks."""
    return {
        "tasks": [task.value for task in WorkflowTask],
        "descriptions": {
            WorkflowTask.COMPETITOR_IDENTIFICATION.value: "Identify top competitors in the market",
            WorkflowTask.TRAFFIC_ANALYSIS.value: "Analyze website traffic patterns",
            WorkflowTask.MARKET_GAP_ANALYSIS.value: "Identify market gaps and opportunities",
            WorkflowTask.GROWTH_OPPORTUNITY_IDENTIFICATION.value: "Find growth opportunities",
            WorkflowTask.META_ADS_DIAGNOSTIC.value: "Diagnose Meta Ads performance issues",
            WorkflowTask.STRATEGIC_RECOMMENDATIONS.value: "Generate strategic recommendations",
            WorkflowTask.EXECUTIVE_SUMMARY.value: "Create executive summary",
        }
    }


@router.post("/config", status_code=200)
async def configure_workflow(config: WorkflowConfigRequest) -> dict[str, str]:
    """Configure which AI provider to use for each workflow task."""
    from app.services.workflow_service import WorkflowConfig
    
    # Validate task names
    valid_tasks = {task.value for task in WorkflowTask}
    for task_name in config.config.keys():
        if task_name not in valid_tasks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid task: {task_name}. Valid tasks: {list(valid_tasks)}"
            )
    
    # Validate provider names
    available_providers = AIProviderFactory.list_available_providers()
    for provider in config.config.values():
        if provider not in available_providers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Provider {provider} not available. Available: {available_providers}"
            )
    
    # Update workflow configuration
    workflow_config = WorkflowConfig(config.config)
    workflow_service.config = workflow_config
    
    return {"status": "configured", "config": config.config}


@router.post("/execute", response_model=WorkflowResponse)
async def execute_workflow(request: WorkflowExecutionRequest) -> WorkflowResponse:
    """Execute a complete market research workflow."""
    try:
        # Extract competitor domains from competitor_data if available
        competitor_domains = []
        if request.competitor_data:
            # Try to extract domains from competitor data
            if isinstance(request.competitor_data, dict):
                for key, value in request.competitor_data.items():
                    if isinstance(value, dict) and "url" in value:
                        competitor_domains.append(value["url"])
                    elif isinstance(value, str) and ("http" in value or "." in value):
                        competitor_domains.append(value)
        
        result = await workflow_service.generate_market_research_report(
            domain=request.domain,
            meta_data=request.meta_data,
            competitor_data=request.competitor_data,
            custom_config=request.custom_config,
            competitor_domains=competitor_domains if competitor_domains else None
        )
        return WorkflowResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}"
        )


@router.post("/task", response_model=TaskExecutionResponse)
async def execute_task(request: TaskExecutionRequest) -> TaskExecutionResponse:
    """Execute a single workflow task with a specific AI provider."""
    try:
        # Validate task
        try:
            task = WorkflowTask(request.task)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid task: {request.task}"
            )
        
        # Execute task
        response = workflow_service.execute_task(
            task=task,
            prompt=request.prompt,
            provider=request.provider,
            model=request.model
        )
        
        return TaskExecutionResponse(
            content=response.content,
            provider=response.provider,
            model=response.model,
            metadata=response.metadata
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Task execution failed: {str(e)}"
        )

