from __future__ import annotations

import math
from datetime import timedelta

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import joinedload, selectinload

from ..database import utcnow
from ..deps import CurrentUser, DbSession
from ..models import Delivery, Endpoint, Event
from ..presenters import delivery_detail, delivery_read
from ..schemas import DeliveryDetail, DeliveryRead, Stats

router = APIRouter(prefix="/api", tags=["deliveries"])

TERMINAL = ("succeeded", "dead")


def _owned_delivery(db, user_id: str, delivery_id: str) -> Delivery:
    delivery = db.scalar(
        select(Delivery)
        .join(Event, Event.id == Delivery.event_id)
        .where(Delivery.id == delivery_id, Event.user_id == user_id)
        .options(
            joinedload(Delivery.endpoint),
            selectinload(Delivery.event),
            selectinload(Delivery.attempts_log),
        )
    )
    if delivery is None:
        raise HTTPException(status_code=404, detail="Delivery not found")
    return delivery


@router.get("/deliveries", response_model=list[DeliveryRead])
def list_deliveries(
    user: CurrentUser,
    db: DbSession,
    status_filter: str | None = Query(
        default=None, alias="status", pattern="^(pending|delivering|succeeded|dead)$"
    ),
    event_id: str | None = Query(default=None),
    endpoint_id: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
) -> list[DeliveryRead]:
    statement = (
        select(Delivery)
        .join(Event, Event.id == Delivery.event_id)
        .where(Event.user_id == user.id)
        .options(joinedload(Delivery.endpoint), selectinload(Delivery.event))
        .order_by(Delivery.created_at.desc())
        .limit(limit)
    )
    if status_filter:
        statement = statement.where(Delivery.status == status_filter)
    if event_id:
        statement = statement.where(Delivery.event_id == event_id)
    if endpoint_id:
        statement = statement.where(Delivery.endpoint_id == endpoint_id)

    deliveries = db.scalars(statement).all()
    return [delivery_read(delivery) for delivery in deliveries]


@router.get("/deliveries/{delivery_id}", response_model=DeliveryDetail)
def get_delivery(
    delivery_id: str, user: CurrentUser, db: DbSession
) -> DeliveryDetail:
    return delivery_detail(_owned_delivery(db, user.id, delivery_id))


@router.post(
    "/deliveries/{delivery_id}/replay",
    response_model=DeliveryDetail,
    status_code=status.HTTP_201_CREATED,
)
def replay_delivery(
    delivery_id: str, user: CurrentUser, db: DbSession
) -> DeliveryDetail:
    original = _owned_delivery(db, user.id, delivery_id)

    if original.status not in TERMINAL:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This delivery is still in flight",
        )
    if not original.endpoint.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The endpoint is paused; resume it before replaying",
        )

    # A replay is a new row. Rewriting the original would erase the history that
    # made the failure worth looking at.
    replay = Delivery(
        event_id=original.event_id,
        endpoint_id=original.endpoint_id,
        status="pending",
        max_attempts=original.max_attempts,
        next_attempt_at=utcnow(),
    )
    db.add(replay)
    db.commit()

    return delivery_detail(_owned_delivery(db, user.id, replay.id))


@router.get("/stats", response_model=Stats)
def stats(user: CurrentUser, db: DbSession) -> Stats:
    since = utcnow() - timedelta(hours=24)

    endpoints = db.scalar(
        select(func.count(Endpoint.id)).where(Endpoint.user_id == user.id)
    ) or 0
    active_endpoints = db.scalar(
        select(func.count(Endpoint.id)).where(
            Endpoint.user_id == user.id, Endpoint.is_active.is_(True)
        )
    ) or 0

    def delivery_count(*conditions) -> int:
        return (
            db.scalar(
                select(func.count(Delivery.id))
                .join(Event, Event.id == Delivery.event_id)
                .where(Event.user_id == user.id, *conditions)
            )
            or 0
        )

    events_24h = db.scalar(
        select(func.count(Event.id)).where(
            Event.user_id == user.id, Event.created_at >= since
        )
    ) or 0
    deliveries_24h = delivery_count(Delivery.created_at >= since)
    pending = delivery_count(Delivery.status.in_(("pending", "delivering")))
    dead = delivery_count(Delivery.status == "dead")
    succeeded_24h = delivery_count(
        Delivery.status == "succeeded", Delivery.created_at >= since
    )
    terminal = delivery_count(Delivery.status.in_(TERMINAL))
    succeeded_total = delivery_count(Delivery.status == "succeeded")

    durations = db.scalars(
        select(Delivery.duration_ms)
        .join(Event, Event.id == Delivery.event_id)
        .where(
            Event.user_id == user.id,
            Delivery.status == "succeeded",
            Delivery.duration_ms.is_not(None),
            Delivery.created_at >= since,
        )
        .order_by(Delivery.duration_ms)
    ).all()

    p95 = None
    if durations:
        index = max(0, math.ceil(0.95 * len(durations)) - 1)
        p95 = int(durations[index])

    success_rate = round(succeeded_total / terminal * 100, 1) if terminal else 0.0

    return Stats(
        endpoints=endpoints,
        active_endpoints=active_endpoints,
        events_24h=events_24h,
        deliveries_24h=deliveries_24h,
        pending=pending,
        dead=dead,
        succeeded_24h=succeeded_24h,
        success_rate=success_rate,
        p95_latency_ms=p95,
    )
