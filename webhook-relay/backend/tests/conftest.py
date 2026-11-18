from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


@pytest.fixture
def settings(tmp_path) -> Settings:
    database = tmp_path / "relay-test.db"
    return Settings(
        database_url=f"sqlite:///{database.as_posix()}",
        jwt_secret="test-secret",
        run_worker=False,
        max_attempts=3,
        retry_base_seconds=1.0,
        retry_max_seconds=8.0,
        retry_jitter=0.0,
        request_timeout_seconds=2.0,
        worker_poll_seconds=0.01,
    )


@pytest.fixture
def app(settings: Settings):
    return create_app(settings)


@pytest.fixture
def client(app):
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def account(client: TestClient) -> dict:
    response = client.post(
        "/api/auth/register",
        json={"email": "dev@example.com", "password": "correct-horse-battery"},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    return {
        "headers": {"Authorization": f"Bearer {body['access_token']}"},
        "api_key": body["api_key"],
        "user": body["user"],
    }
