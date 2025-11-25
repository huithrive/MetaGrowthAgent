from celery.schedules import crontab

from app.tasks.refresh import refresh_account_task

HOURLY_REFRESH_SCHEDULE = {
    "refresh-default-account": {
        "interval": crontab(minute=0),  # top of every hour
        "task": refresh_account_task.s(),  # type: ignore[attr-defined]
        "args": (),
        "kwargs": {"account_id": "123456789", "domain": "example.com"},
    }
}

