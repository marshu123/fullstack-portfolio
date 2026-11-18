"""Runtime configuration, read once from the environment.

Every value has a development default so the service runs without a .env file.
Deployments are expected to set at least DATABASE_URL and JWT_SECRET.
"""

from __future__ import annotations

import os
from dataclasses import dataclass


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _env_list(name: str, default: tuple[str, ...]) -> tuple[str, ...]:
    raw = os.getenv(name)
    if raw is None or raw.strip() == "":
        return default
    return tuple(item.strip() for item in raw.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    # Storage. SQLite is the default so the project runs with no services.
    database_url: str = "sqlite:///./relay.db"

    # Auth
    jwt_secret: str = "dev-only-change-me"
    jwt_expiry_minutes: int = 60 * 12

    # Delivery policy
    max_attempts: int = 6
    retry_base_seconds: float = 5.0
    retry_max_seconds: float = 900.0
    retry_jitter: float = 0.15
    request_timeout_seconds: float = 10.0

    # Worker
    run_worker: bool = True
    worker_poll_seconds: float = 1.0
    worker_concurrency: int = 5
    worker_batch_size: int = 25
    claim_lease_seconds: int = 60

    # Receiver-side signature checks
    signature_tolerance_seconds: int = 300
    response_body_limit: int = 2000

    # HTTP
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    )

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            database_url=os.getenv("DATABASE_URL", cls.database_url),
            jwt_secret=os.getenv("JWT_SECRET", cls.jwt_secret),
            jwt_expiry_minutes=_env_int("JWT_EXPIRY_MINUTES", cls.jwt_expiry_minutes),
            max_attempts=_env_int("MAX_ATTEMPTS", cls.max_attempts),
            retry_base_seconds=_env_float("RETRY_BASE_SECONDS", cls.retry_base_seconds),
            retry_max_seconds=_env_float("RETRY_MAX_SECONDS", cls.retry_max_seconds),
            retry_jitter=_env_float("RETRY_JITTER", cls.retry_jitter),
            request_timeout_seconds=_env_float(
                "REQUEST_TIMEOUT_SECONDS", cls.request_timeout_seconds
            ),
            run_worker=_env_bool("RUN_WORKER", cls.run_worker),
            worker_poll_seconds=_env_float(
                "WORKER_POLL_SECONDS", cls.worker_poll_seconds
            ),
            worker_concurrency=_env_int("WORKER_CONCURRENCY", cls.worker_concurrency),
            worker_batch_size=_env_int("WORKER_BATCH_SIZE", cls.worker_batch_size),
            claim_lease_seconds=_env_int(
                "CLAIM_LEASE_SECONDS", cls.claim_lease_seconds
            ),
            signature_tolerance_seconds=_env_int(
                "SIGNATURE_TOLERANCE_SECONDS", cls.signature_tolerance_seconds
            ),
            response_body_limit=_env_int(
                "RESPONSE_BODY_LIMIT", cls.response_body_limit
            ),
            cors_origins=_env_list("CORS_ORIGINS", cls.cors_origins),
        )
