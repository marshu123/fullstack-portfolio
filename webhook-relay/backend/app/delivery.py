"""Sending one webhook attempt and deciding what happens next."""

from __future__ import annotations

import json
import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from sqlalchemy.orm import Session

from .config import Settings
from .database import utcnow
from .models import Delivery, DeliveryAttempt
from .signing import SIGNATURE_HEADER, sign

USER_AGENT = "Relay-Webhooks/1.0"


def retry_delay_seconds(
    attempt_number: int,
    *,
    base: float,
    max_delay: float,
    jitter: float = 0.0,
    rand: float | None = None,
) -> float:
    """Exponential backoff: base, 2x base, 4x base ... capped.

    Jitter spreads retries so a receiver coming back online is not hit by every
    queued delivery in the same second.
    """
    exponent = max(0, attempt_number - 1)
    delay = min(base * (2**exponent), max_delay)
    if jitter > 0:
        roll = random.random() if rand is None else rand
        delay *= 1 + jitter * (2 * roll - 1)
    return round(max(0.0, delay), 3)


def serialize_payload(payload: dict[str, Any]) -> bytes:
    """Canonical body. Receivers must verify the raw bytes, not a re-encode."""
    return json.dumps(
        payload, sort_keys=True, separators=(",", ":"), default=str
    ).encode("utf-8")


def build_headers(
    *,
    delivery: Delivery,
    event_type: str,
    secret: str,
    body: bytes,
    timestamp: int | None = None,
) -> dict[str, str]:
    return {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        "X-Relay-Delivery": delivery.id,
        "X-Relay-Event": event_type,
        "X-Relay-Attempt": str(delivery.attempts + 1),
        SIGNATURE_HEADER: sign(secret, body, timestamp),
    }


@dataclass(frozen=True)
class SendResult:
    outcome: str  # success | http_error | timeout | network_error
    status_code: int | None
    body: str | None
    error: str | None
    duration_ms: int


async def send_webhook(
    client: httpx.AsyncClient,
    *,
    url: str,
    body: bytes,
    headers: dict[str, str],
    timeout: float,
    body_limit: int,
) -> SendResult:
    started = time.perf_counter()
    try:
        response = await client.post(
            url, content=body, headers=headers, timeout=timeout
        )
    except httpx.TimeoutException:
        return SendResult(
            outcome="timeout",
            status_code=None,
            body=None,
            error=f"Timed out after {timeout:g}s",
            duration_ms=int((time.perf_counter() - started) * 1000),
        )
    except httpx.RequestError as exc:
        message = f"{type(exc).__name__}: {exc}".strip()
        return SendResult(
            outcome="network_error",
            status_code=None,
            body=None,
            error=message[:500],
            duration_ms=int((time.perf_counter() - started) * 1000),
        )

    duration_ms = int((time.perf_counter() - started) * 1000)
    excerpt = response.text[:body_limit] if response.text else None
    ok = 200 <= response.status_code < 300
    return SendResult(
        outcome="success" if ok else "http_error",
        status_code=response.status_code,
        body=excerpt,
        error=None if ok else f"Receiver returned HTTP {response.status_code}",
        duration_ms=duration_ms,
    )


async def attempt_delivery(
    session: Session,
    delivery: Delivery,
    client: httpx.AsyncClient,
    settings: Settings,
    *,
    now: datetime | None = None,
) -> Delivery:
    """Make one attempt and persist both the log row and the new retry state."""
    attempted_at = now or utcnow()
    attempt_number = delivery.attempts + 1
    body = serialize_payload(delivery.event.payload)
    headers = build_headers(
        delivery=delivery,
        event_type=delivery.event.type,
        secret=delivery.endpoint.secret,
        body=body,
        # attempted_at is naive UTC; timestamp() would assume local time.
        timestamp=int(attempted_at.replace(tzinfo=timezone.utc).timestamp()),
    )

    result = await send_webhook(
        client,
        url=delivery.endpoint.url,
        body=body,
        headers=headers,
        timeout=settings.request_timeout_seconds,
        body_limit=settings.response_body_limit,
    )

    session.add(
        DeliveryAttempt(
            delivery_id=delivery.id,
            attempt_number=attempt_number,
            outcome=result.outcome,
            status_code=result.status_code,
            response_body=result.body,
            error=result.error,
            duration_ms=result.duration_ms,
            attempted_at=attempted_at,
        )
    )

    delivery.attempts = attempt_number
    delivery.last_attempt_at = attempted_at
    delivery.response_status = result.status_code
    delivery.response_body = result.body
    delivery.error = result.error
    delivery.duration_ms = result.duration_ms

    if result.outcome == "success":
        delivery.status = "succeeded"
        delivery.next_attempt_at = None
        delivery.completed_at = attempted_at
    elif attempt_number >= delivery.max_attempts:
        delivery.status = "dead"
        delivery.next_attempt_at = None
        delivery.completed_at = attempted_at
    else:
        delivery.status = "pending"
        delay = retry_delay_seconds(
            attempt_number,
            base=settings.retry_base_seconds,
            max_delay=settings.retry_max_seconds,
            jitter=settings.retry_jitter,
        )
        delivery.next_attempt_at = attempted_at + timedelta(seconds=delay)

    session.commit()
    return delivery
