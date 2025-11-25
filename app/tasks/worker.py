from celery import Celery

from app.config import get_settings

settings = get_settings()

celery_app = Celery(
    "meta_growth_agent",
    broker=settings.redis_url,
    backend=settings.redis_url,
)
celery_app.autodiscover_tasks(["app.tasks"])


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):  # type: ignore[no-untyped-def]
    from app.tasks.schedules import HOURLY_REFRESH_SCHEDULE

    for name, schedule in HOURLY_REFRESH_SCHEDULE.items():
        sender.add_periodic_task(  # type: ignore[attr-defined]
            schedule["interval"],
            schedule["task"],
            name=name,
            args=schedule.get("args", ()),
            kwargs=schedule.get("kwargs", {}),
        )

