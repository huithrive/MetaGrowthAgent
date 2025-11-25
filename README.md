# Meta Growth Agent

A full-stack platform that fuses Meta Ads diagnostics, third-party traffic intelligence, and LLM-driven narrative insights to surface e-commerce growth opportunities. Includes a modern React frontend for e-commerce business owners and micro agency marketers.

## High-Level Architecture

- **FastAPI** service hosts public/internal REST APIs and webhooks.
- **Celery** worker pool handles hourly refresh jobs, login-triggered refreshes, report generation, and alert fan-out.
- **Redis** is shared across Celery (broker + result backend) and cache for hot metrics.
- **PostgreSQL** stores normalized ad/traffic snapshots, generated insight artifacts, delivery status, and audit logs.
- **Insight Service** wraps Claude (Anthropic) and Gemini (Google) APIs behind a unified prompt/rendering layer.
- **Reporting pipeline** converts structured findings into HTML/PDF artifacts and API payloads.
- **Alerting** fan-outs to Slack/email/webhook endpoints when anomalies are detected.

```
Meta Ads API ─┐
              ├─▶ Ingest Services ─▶ Normalized Store ─▶ Insight Engine ─▶ Reports API
Competitor API┘                                   │                         │
                                                 └─▶ Alert Router ────────┘
```

## Key Features

- Hourly refresh via Celery beat + Redis; configurable staleness guards for login-triggered refresh.
- API surface:
  - `GET /health` readiness
  - `POST /auth/login` (placeholder)
  - `GET /reports/{account_id}` latest insight bundle
  - `POST /reports/{account_id}/refresh` manual refresh trigger
  - `GET /alerts` to review recent anomaly notifications
- Pluggable data-provider abstraction for Meta Ads and Similarweb-like sources.
- Prompt templating with Jinja2 for deterministic report voice and content.
- Structured logging via `structlog` + OpenTelemetry-ready instrumentation hooks.

## Tech Stack

| Concern | Choice | Notes |
| --- | --- | --- |
| API framework | FastAPI | Async, OpenAPI out of the box |
| ORM | SQLModel (SQLAlchemy + Pydantic) | Type-safe models and schema reuse |
| Scheduler / Workers | Celery + Redis | Hourly recurring jobs & fan-out |
| Cache / Broker | Redis 7 | Hot metrics cache & Celery backend |
| DB | PostgreSQL 16 | Durable state, JSONB for report payloads |
| LLM Providers | Anthropic Claude 3.5, Google Gemini 1.5 | Configurable per report |
| HTTP client | httpx | Async-friendly |
| Serialization | Pydantic v2 | Strong typing |
| Packaging | `pyproject.toml` (uv/pip) | Lightweight |

## Getting Started

### Backend Setup

```bash
uv venv --python 3.11
source .venv/bin/activate
uv pip install -r requirements.txt  # or `uv pip install -e .`
cp .env.example .env
```

### Local services

```bash
docker compose up -d redis postgres
```

### Run Backend API & Workers

```bash
uvicorn app.main:app --reload
celery -A app.tasks.worker worker -l info
celery -A app.tasks.worker beat -l info
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local and set VITE_API_URL=http://localhost:8000
npm run dev
```

The frontend will be available at `http://localhost:5173` and will connect to the backend API.

## Configuration

Environment variables are centralized in `app/config.py`. Key values:

- `DATABASE_URL`
- `REDIS_URL`
- `META_ADS_TOKEN`, `META_ADS_ACCOUNT_ID`
- `COMP_INTEL_API_KEY`
- `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`
- `ALERT_WEBHOOK_URL`

Refer to `.env.example` for defaults.

## Project Layout

```
app/
  main.py                # FastAPI entrypoint
  config.py              # Settings management
  db.py                  # Engine + session utilities
  logging_config.py      # structlog setup
  routers/
    reports.py
    alerts.py
    auth.py
  services/
    meta_client.py
    competitor_client.py
    insight_service.py
    report_service.py
    alert_service.py
    cache_service.py
  tasks/
    __init__.py
    schedules.py
    worker.py
    refresh.py
frontend/                # React + TypeScript frontend
  components/            # UI components
  services/              # API client
  App.tsx                # Main app component
docs/
  architecture.md        # Extended diagrams / flows
infrastructure/
  docker-compose.yml
  Dockerfile
```

## Roadmap

- [ ] Wire actual Meta/Similarweb SDK calls and pagination.
- [ ] Implement auth/session layer (JWT or OAuth).
- [ ] Add Alembic migrations and seed scripts.
- [ ] Extend alert router to Slack + PagerDuty connectors.
- [ ] Ship CLI (`scripts/cli.py`) for manual resync & test data.

## Security & Compliance

- Secrets pulled via env or secret stores only.
- Prompt/LLM payloads scrubbed for PII before logging.
- Token refresh hooks ready for long-lived Meta Ads integrations.

## Testing

Sample tests will live in `tests/` (pytest + httpx AsyncClient). Stubs are included for service layers to encourage TDD.

---

This scaffold is intentionally modular so that you can deploy API, worker, and beat containers independently as the workload scales.

