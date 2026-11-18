from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select

from ..deps import AppSettings, CurrentUser, DbSession, IngestUser
from ..models import Delivery, Event
from ..presenters import delivery_read, event_read
from ..schemas import EventCreate, EventDetail, EventRead
from ..service import create_event

router = APIRouter(prefix="/api", tags=["events"])


def _counts(db, event_ids: list[str]) -> dict[str, dict[str, int]]:
    if not event_ids:
        return {}
    rows = db.execute(
        select(Delivery.event_id, Delivery.status, func.count(Delivery.id))
        .where(Delivery.event_id.in_(event_ids))
        .group_by(Delivery.event_id, Delivery.status)
    ).all()

    result: dict[str, dict[str, int]] = {}
    for event_id, delivery_status, count in rows:
        bucket = result.setdefault(event_id, {"total": 0})
        bucket[delivery_status] = count
        bucket["total"] += count
    return result


@router.post(
    "/events", response_model=EventRead, status_code=status.HTTP_201_CREATED
)
def create_event_as_user(
    payload: EventCreate,
    user: CurrentUser,
    db: DbSession,
    settings: AppSettings,
) -> EventRead:
    event = create_event(
        db,
        user,
        payload.type,
        payload.payload,
        max_attempts=settings.max_attempts,
    )
    return event_read(event, _counts(db, [event.id]).get(event.id))


@router.post(
    "/ingest", response_model=EventRead, status_code=status.HTTP_201_CREATED
)
def ingest_event(
    payload: EventCreate,
    user: IngestUser,
    db: DbSession,
    settings: AppSettings,
) -> EventRead:
    """Machine-to-machine ingestion, authenticated with X-API-Key."""
    event = create_event(
        db,
        user,
        payload.type,
        payload.payload,
        max_attempts=settings.max_attempts,
    )
    return event_read(event, _counts(db, [event.id]).get(event.id))


@router.get("/events", response_model=list[EventRead])
def list_events(
    user: CurrentUser,
    db: DbSession,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> list[EventRead]:
    events = db.scalars(
        select(Event)
        .where(Event.user_id == user.id)
        .order_by(Event.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    counts = _counts(db, [event.id for event in events])
    return [event_read(event, counts.get(event.id)) for event in events]


@router.get("/events/{event_id}", response_model=EventDetail)
def get_event(event_id: str, user: CurrentUser, db: DbSession) -> EventDetail:
    event = db.scalar(
        select(Event).where(Event.id == event_id, Event.user_id == user.id)
    )
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    base = event_read(event, _counts(db, [event.id]).get(event.id))
    return EventDetail(
        **base.model_dump(),
        deliveries=[delivery_read(delivery) for delivery in event.deliveries],
    )
