"""Mapping ORM rows to API records."""

from __future__ import annotations

from .models import Delivery, DeliveryAttempt, Event
from .schemas import AttemptRead, DeliveryDetail, DeliveryRead, EventRead


def delivery_read(delivery: Delivery) -> DeliveryRead:
    return DeliveryRead(
        id=delivery.id,
        event_id=delivery.event_id,
        event_type=delivery.event.type,
        endpoint_id=delivery.endpoint_id,
        endpoint_url=delivery.endpoint.url,
        status=delivery.status,
        attempts=delivery.attempts,
        max_attempts=delivery.max_attempts,
        next_attempt_at=delivery.next_attempt_at,
        last_attempt_at=delivery.last_attempt_at,
        response_status=delivery.response_status,
        error=delivery.error,
        duration_ms=delivery.duration_ms,
        created_at=delivery.created_at,
        completed_at=delivery.completed_at,
    )


def attempt_read(attempt: DeliveryAttempt) -> AttemptRead:
    return AttemptRead.model_validate(attempt)


def delivery_detail(delivery: Delivery) -> DeliveryDetail:
    base = delivery_read(delivery)
    return DeliveryDetail(
        **base.model_dump(),
        payload=delivery.event.payload,
        attempt_log=[attempt_read(item) for item in delivery.attempts_log],
    )


def event_read(
    event: Event,
    counts: dict[str, int] | None = None,
) -> EventRead:
    counts = counts or {}
    return EventRead(
        id=event.id,
        type=event.type,
        payload=event.payload,
        created_at=event.created_at,
        delivery_count=counts.get("total", 0),
        succeeded_count=counts.get("succeeded", 0),
        pending_count=counts.get("pending", 0) + counts.get("delivering", 0),
        dead_count=counts.get("dead", 0),
    )
