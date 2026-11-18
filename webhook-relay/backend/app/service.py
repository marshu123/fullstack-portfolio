"""Fan-out logic shared by the event routes and endpoint tests."""

from __future__ import annotations

from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import utcnow
from .models import Delivery, Endpoint, Event, User


def create_event(
    session: Session,
    user: User,
    event_type: str,
    payload: dict[str, Any],
    *,
    max_attempts: int = 6,
    targets: list[Endpoint] | None = None,
    force: bool = False,
) -> Event:
    """Store an event and create one pending delivery per matching endpoint.

    ``targets`` limits fan-out (used by "send test" to hit a single receiver).
    ``force`` skips the event-type subscription filter, still respecting pause.
    """
    event = Event(user_id=user.id, type=event_type, payload=payload)
    session.add(event)
    session.flush()

    if targets is None:
        endpoints = session.scalars(
            select(Endpoint).where(
                Endpoint.user_id == user.id, Endpoint.is_active.is_(True)
            )
        ).all()
    else:
        endpoints = targets

    now = utcnow()
    for endpoint in endpoints:
        if endpoint.user_id != user.id:
            continue
        if not endpoint.is_active:
            continue
        if not force and not endpoint.accepts(event_type):
            continue
        session.add(
            Delivery(
                event_id=event.id,
                endpoint_id=endpoint.id,
                status="pending",
                max_attempts=max_attempts,
                next_attempt_at=now,
            )
        )

    session.commit()
    session.refresh(event)
    return event
