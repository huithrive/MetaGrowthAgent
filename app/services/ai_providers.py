"""AI Provider abstraction layer supporting multiple LLM providers."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

import anthropic
import google.generativeai as genai
from pydantic import BaseModel

from app.config import get_settings

settings = get_settings()


class AIResponse(BaseModel):
    """Standardized AI response format."""
    content: str
    provider: str
    model: str
    metadata: dict[str, Any] = {}


class AIProvider(ABC):
    """Base class for AI providers."""
    
    @abstractmethod
    def generate(self, prompt: str, **kwargs: Any) -> AIResponse:
        """Generate a response from the AI provider."""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is configured and available."""
        pass


class ClaudeProvider(AIProvider):
    """Anthropic Claude provider."""
    
    def __init__(self) -> None:
        self.client = None
        if settings.anthropic_api_key:
            self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self.model = "claude-3-5-sonnet-20240620"
    
    def is_available(self) -> bool:
        return self.client is not None
    
    def generate(self, prompt: str, model: str | None = None, max_tokens: int = 2000, **kwargs: Any) -> AIResponse:
        if not self.is_available():
            raise ValueError("Claude API key not configured")
        
        model_name = model or self.model
        message = self.client.messages.create(
            model=model_name,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
            **kwargs
        )
        
        text = message.content[0].text if message.content else ""
        return AIResponse(
            content=text,
            provider="claude",
            model=model_name,
            metadata={"usage": getattr(message, "usage", {})}
        )


class GeminiProvider(AIProvider):
    """Google Gemini provider - supports Gemini 3 and other models."""
    
    def __init__(self) -> None:
        self.client = None
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self.client = genai
        self.default_model = "gemini-1.5-pro"
    
    def is_available(self) -> bool:
        return self.client is not None
    
    def generate(self, prompt: str, model: str | None = None, **kwargs: Any) -> AIResponse:
        if not self.is_available():
            raise ValueError("Gemini API key not configured")
        
        # Support Gemini 3 models
        model_name = model or self.default_model
        # Try gemini-3-pro-preview first, fallback to gemini-1.5-pro
        try:
            genai_model = self.client.GenerativeModel(model_name)
        except Exception:
            # Fallback to default if model not available
            genai_model = self.client.GenerativeModel(self.default_model)
        
        response = genai_model.generate_content(
            prompt,
            generation_config=kwargs.get("generation_config"),
        )
        
        text = response.text or ""
        return AIResponse(
            content=text,
            provider="gemini",
            model=model_name,
            metadata={"candidates": len(response.candidates) if hasattr(response, "candidates") else 0}
        )


class AIProviderFactory:
    """Factory for creating AI providers."""
    
    _providers: dict[str, AIProvider] = {}
    
    @classmethod
    def get_provider(cls, provider_name: str) -> AIProvider:
        """Get or create an AI provider instance."""
        provider_name = provider_name.lower()
        
        if provider_name not in cls._providers:
            if provider_name == "claude":
                cls._providers[provider_name] = ClaudeProvider()
            elif provider_name == "gemini":
                cls._providers[provider_name] = GeminiProvider()
            else:
                raise ValueError(f"Unknown provider: {provider_name}")
        
        provider = cls._providers[provider_name]
        if not provider.is_available():
            raise ValueError(f"Provider {provider_name} is not configured")
        
        return provider
    
    @classmethod
    def list_available_providers(cls) -> list[str]:
        """List all available providers."""
        available = []
        if settings.anthropic_api_key:
            available.append("claude")
        if settings.google_api_key:
            available.append("gemini")
        return available

