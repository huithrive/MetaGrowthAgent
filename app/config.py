from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    environment: str = Field("local", alias="ENVIRONMENT")
    api_host: str = Field("0.0.0.0", alias="API_HOST")
    api_port: int = Field(8000, alias="API_PORT")

    database_url: str = Field("sqlite:///./meta_agent.db", alias="DATABASE_URL")
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")

    jwt_secret: str = Field("change-me", alias="JWT_SECRET")
    jwt_exp_minutes: int = Field(60, alias="JWT_EXP_MINUTES")

    meta_ads_token: str = Field("", alias="META_ADS_TOKEN")
    meta_business_id: str = Field("", alias="META_BUSINESS_ID")

    comp_intel_api_key: str = Field("", alias="COMP_INTEL_API_KEY")

    llm_provider: str = Field("claude", alias="LLM_PROVIDER")
    anthropic_api_key: str = Field("", alias="ANTHROPIC_API_KEY")
    google_api_key: str = Field("", alias="GOOGLE_API_KEY")
    
    # Gemini model selection (supports gemini-3-pro-preview, gemini-1.5-pro, etc.)
    gemini_model: str = Field("gemini-1.5-pro", alias="GEMINI_MODEL")
    
    # Claude model selection
    claude_model: str = Field("claude-3-5-sonnet-20240620", alias="CLAUDE_MODEL")

    alert_webhook_url: str = Field("", alias="ALERT_WEBHOOK_URL")
    alert_emails: str = Field("", alias="ALERT_EMAILS")

    report_bucket_path: str = Field("/reports", alias="REPORT_BUCKET_PATH")

    otel_endpoint: str = Field("", alias="OTEL_EXPORTER_OTLP_ENDPOINT")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()

