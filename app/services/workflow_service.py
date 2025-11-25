"""Workflow service for orchestrating multi-step market research tasks with different AI providers."""
from __future__ import annotations

from enum import Enum
from typing import Any

from app.services.ai_providers import AIProviderFactory, AIResponse


class WorkflowTask(str, Enum):
    """Market research workflow tasks."""
    COMPETITOR_IDENTIFICATION = "competitor_identification"
    TRAFFIC_ANALYSIS = "traffic_analysis"
    MARKET_GAP_ANALYSIS = "market_gap_analysis"
    GROWTH_OPPORTUNITY_IDENTIFICATION = "growth_opportunity"
    META_ADS_DIAGNOSTIC = "meta_ads_diagnostic"
    STRATEGIC_RECOMMENDATIONS = "strategic_recommendations"
    EXECUTIVE_SUMMARY = "executive_summary"


class WorkflowConfig:
    """Configuration for which AI to use for each workflow task."""
    
    def __init__(self, config: dict[str, str] | None = None):
        """Initialize workflow configuration.
        
        Args:
            config: Dictionary mapping task names to provider names.
                   If None, uses default configuration.
        """
        default_config = {
            WorkflowTask.COMPETITOR_IDENTIFICATION: "gemini",  # Gemini 3 excels at web research
            WorkflowTask.TRAFFIC_ANALYSIS: "gemini",  # Good at data analysis
            WorkflowTask.MARKET_GAP_ANALYSIS: "claude",  # Claude is great at strategic analysis
            WorkflowTask.GROWTH_OPPORTUNITY_IDENTIFICATION: "claude",  # Strategic thinking
            WorkflowTask.META_ADS_DIAGNOSTIC: "gemini",  # Can analyze structured data well
            WorkflowTask.STRATEGIC_RECOMMENDATIONS: "claude",  # Best for nuanced recommendations
            WorkflowTask.EXECUTIVE_SUMMARY: "claude",  # Polished summaries
        }
        
        self.config = {**default_config, **(config or {})}
    
    def get_provider_for_task(self, task: WorkflowTask) -> str:
        """Get the AI provider for a specific task."""
        return self.config.get(task, "claude")
    
    def set_provider_for_task(self, task: WorkflowTask, provider: str) -> None:
        """Set the AI provider for a specific task."""
        self.config[task] = provider


class WorkflowService:
    """Service for executing market research workflows with configurable AI providers."""
    
    def __init__(self, workflow_config: WorkflowConfig | None = None):
        self.config = workflow_config or WorkflowConfig()
    
    def execute_task(
        self,
        task: WorkflowTask,
        prompt: str,
        provider: str | None = None,
        **kwargs: Any
    ) -> AIResponse:
        """Execute a single workflow task with the specified or configured AI provider.
        
        Args:
            task: The workflow task to execute
            prompt: The prompt for the AI
            provider: Override the configured provider for this task
            **kwargs: Additional arguments to pass to the AI provider
        
        Returns:
            AIResponse with the generated content
        """
        provider_name = provider or self.config.get_provider_for_task(task)
        ai_provider = AIProviderFactory.get_provider(provider_name)
        
        # Task-specific model selection
        model_override = kwargs.pop("model", None)
        if model_override:
            kwargs["model"] = model_override
        
        return ai_provider.generate(prompt, **kwargs)
    
    def execute_workflow(
        self,
        tasks: list[tuple[WorkflowTask, str]],
        **kwargs: Any
    ) -> dict[WorkflowTask, AIResponse]:
        """Execute multiple workflow tasks in sequence.
        
        Args:
            tasks: List of (task, prompt) tuples
            **kwargs: Additional arguments for all tasks
        
        Returns:
            Dictionary mapping tasks to their responses
        """
        results = {}
        for task, prompt in tasks:
            results[task] = self.execute_task(task, prompt, **kwargs)
        return results
    
    def generate_market_research_report(
        self,
        domain: str,
        meta_data: dict[str, Any],
        competitor_data: dict[str, Any],
        custom_config: dict[str, str] | None = None
    ) -> dict[str, Any]:
        """Generate a complete market research report using the workflow.
        
        Args:
            domain: The domain being analyzed
            meta_data: Meta Ads performance data
            competitor_data: Competitor intelligence data
            custom_config: Optional custom AI provider configuration
        
        Returns:
            Complete market research report with insights from each workflow step
        """
        if custom_config:
            workflow_config = WorkflowConfig(custom_config)
            self.config = workflow_config
        
        # Step 1: Competitor Identification (Gemini 3 - web research)
        competitor_prompt = f"""
        Analyze the market for {domain} and identify the top 5 direct competitors.
        Focus on brands that compete in Meta Ads auctions.
        Provide: name, URL, and key strength for each competitor.
        Format as JSON array.
        """
        
        # Step 2: Market Gap Analysis (Claude - strategic thinking)
        gap_prompt = f"""
        Based on this Meta Ads data: {meta_data}
        And competitor data: {competitor_data}
        
        Identify the biggest market gap or inefficiency.
        What opportunity exists that competitors are missing?
        """
        
        # Step 3: Growth Opportunities (Claude - strategic)
        growth_prompt = f"""
        For {domain}, identify 3 high-impact growth opportunities in Meta Ads.
        Consider: {meta_data} and {competitor_data}
        Provide actionable strategies with projected impact.
        """
        
        # Step 4: Meta Ads Diagnostic (Gemini - data analysis)
        diagnostic_prompt = f"""
        Analyze this Meta Ads performance data: {meta_data}
        Identify the top 3 issues or optimization opportunities.
        Be specific and data-driven.
        """
        
        # Step 5: Strategic Recommendations (Claude - nuanced)
        recommendations_prompt = f"""
        Based on all the analysis above, provide 5 strategic recommendations
        for {domain} to improve Meta Ads performance and capture market share.
        Prioritize by impact and feasibility.
        """
        
        # Step 6: Executive Summary (Claude - polished)
        summary_prompt = f"""
        Create an executive summary for {domain}'s market research analysis.
        Include: key findings, opportunities, and recommended actions.
        Keep it concise and actionable.
        """
        
        # Execute workflow
        tasks = [
            (WorkflowTask.COMPETITOR_IDENTIFICATION, competitor_prompt),
            (WorkflowTask.MARKET_GAP_ANALYSIS, gap_prompt),
            (WorkflowTask.GROWTH_OPPORTUNITY_IDENTIFICATION, growth_prompt),
            (WorkflowTask.META_ADS_DIAGNOSTIC, diagnostic_prompt),
            (WorkflowTask.STRATEGIC_RECOMMENDATIONS, recommendations_prompt),
            (WorkflowTask.EXECUTIVE_SUMMARY, summary_prompt),
        ]
        
        results = self.execute_workflow(tasks)
        
        # Compile report
        return {
            "domain": domain,
            "executive_summary": results[WorkflowTask.EXECUTIVE_SUMMARY].content,
            "competitors": results[WorkflowTask.COMPETITOR_IDENTIFICATION].content,
            "market_gap": results[WorkflowTask.MARKET_GAP_ANALYSIS].content,
            "growth_opportunities": results[WorkflowTask.GROWTH_OPPORTUNITY_IDENTIFICATION].content,
            "meta_diagnostic": results[WorkflowTask.META_ADS_DIAGNOSTIC].content,
            "recommendations": results[WorkflowTask.STRATEGIC_RECOMMENDATIONS].content,
            "workflow_metadata": {
                task.value: {
                    "provider": results[task].provider,
                    "model": results[task].model,
                }
                for task in results.keys()
            }
        }

