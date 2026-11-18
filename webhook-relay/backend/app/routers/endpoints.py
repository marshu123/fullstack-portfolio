from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..deps import AppSettings, CurrentUser, DbSession
from ..models import Endpoint
from ..schemas import EndpointCreate, EndpointRead, EndpointUpdate
from ..security import generate_signing_secret
from ..service import create_event

router = APIRouter(prefix="/api/endpoints", tags=["endpoints"])


def _owned(db, user_id: str, endpoint_id: str) -> Endpoint:
    endpoint = db.scalar(
        select(Endpoint).where(
            Endpoint.id == endpoint_id, Endpoint.user_id == user_id
        )
    )
    if endpoint is None:
        # 404 rather than 403: another user's id should not confirm it exists.
        raise HTTPException(status_code=404, detail="Endpoint not found")
    return endpoint


@router.get("", response_model=list[EndpointRead])
def list_endpoints(user: CurrentUser, db: DbSession) -> list[EndpointRead]:
    endpoints = db.scalars(
        select(Endpoint)
        .where(Endpoint.user_id == user.id)
        .order_by(Endpoint.created_at.desc())
    ).all()
    return [EndpointRead.model_validate(endpoint) for endpoint in endpoints]


@router.post("", response_model=EndpointRead, status_code=status.HTTP_201_CREATED)
def create_endpoint(
    payload: EndpointCreate, user: CurrentUser, db: DbSession
) -> EndpointRead:
    endpoint = Endpoint(
        user_id=user.id,
        url=str(payload.url),
        description=payload.description,
        event_types=payload.event_types,
        secret=generate_signing_secret(),
    )
    db.add(endpoint)
    db.commit()
    db.refresh(endpoint)
    return EndpointRead.model_validate(endpoint)


@router.patch("/{endpoint_id}", response_model=EndpointRead)
def update_endpoint(
    endpoint_id: str,
    payload: EndpointUpdate,
    user: CurrentUser,
    db: DbSession,
) -> EndpointRead:
    endpoint = _owned(db, user.id, endpoint_id)
    changes = payload.model_dump(exclude_unset=True)

    if "url" in changes and changes["url"] is not None:
        endpoint.url = str(changes["url"])
    if "description" in changes and changes["description"] is not None:
        endpoint.description = changes["description"]
    if "event_types" in changes and changes["event_types"] is not None:
        endpoint.event_types = changes["event_types"]
    if "is_active" in changes and changes["is_active"] is not None:
        endpoint.is_active = changes["is_active"]

    db.commit()
    db.refresh(endpoint)
    return EndpointRead.model_validate(endpoint)


@router.delete(
    "/{endpoint_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None
)
def delete_endpoint(endpoint_id: str, user: CurrentUser, db: DbSession) -> None:
    endpoint = _owned(db, user.id, endpoint_id)
    db.delete(endpoint)
    db.commit()


@router.post("/{endpoint_id}/rotate-secret", response_model=EndpointRead)
def rotate_secret(
    endpoint_id: str, user: CurrentUser, db: DbSession
) -> EndpointRead:
    endpoint = _owned(db, user.id, endpoint_id)
    endpoint.secret = generate_signing_secret()
    db.commit()
    db.refresh(endpoint)
    return EndpointRead.model_validate(endpoint)


@router.post("/{endpoint_id}/test", response_model=EndpointRead)
def send_test(
    endpoint_id: str,
    user: CurrentUser,
    db: DbSession,
    settings: AppSettings,
) -> EndpointRead:
    endpoint = _owned(db, user.id, endpoint_id)
    if not endpoint.is_active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Pause is on; resume the endpoint before sending a test",
        )

    create_event(
        db,
        user,
        "endpoint.test",
        {"message": "Test delivery from Relay", "endpoint_id": endpoint.id},
        max_attempts=settings.max_attempts,
        targets=[endpoint],
        force=True,
    )
    return EndpointRead.model_validate(endpoint)
