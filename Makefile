SHELL := /bin/bash

.PHONY: install run worker beat fmt lint test migrate

install:
	uv pip install -e .

run:
	uvicorn app.main:app --reload

worker:
	celery -A app.tasks.worker worker -l info

beat:
	celery -A app.tasks.worker beat -l info

fmt:
	ruff check --fix app tests

lint:
	ruff check app tests
	mypy app

test:
	pytest -q

