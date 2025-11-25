# Architecture Notes

## Data Flow

1. **Ingestion** — Meta Ads + competitor APIs fetched through dedicated service clients.
2. **Normalization** — Data mapped into unified measurement schema (spend, CTR, ROAS, traffic share).
3. **Persistence** — Snapshots stored in Postgres (`report_runs`, `alert_events` tables) and cached in Redis.
4. **Insight Generation** — `InsightService` renders prompt templates + calls Claude/Gemini to synthesize narratives.
5. **Distribution** — Reports served via API and rendered into HTML/PDF; alerts pushed to Slack/webhooks.

## Schedulers

- `hourly_refresh` — Celery beat schedule, per account, orchestrates ingest + insight + alert tasks.
- `login_refresh` — REST-triggered; checks cache age and enqueues priority refresh when stale.

## Scaling

- API instances stateless; rely on Postgres/Redis.
- Worker pool horizontally scales with queue depth.
- Insight calls parallelized but rate-limited via per-provider budgets.

## Observability

- `structlog` JSON logs
- Ready for OTLP traces to Datadog/Honeycomb
- Task metrics emitted via Celery signals (success/failure, runtime)

## Security

- Per-user auth TBD (JWT recommended).
- Secrets injected via env/secret store.
- Data access layer ready for row-level tenant scoping.

