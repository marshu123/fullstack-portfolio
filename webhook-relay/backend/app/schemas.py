"""Request and response models.

The API intentionally returns flat, presentation-ready records. The dashboard
should not have to join an event and an endpoint in the browser to render a row.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, HttpUrl

DeliveryStatus = Literal["pending", "delivering", "succeeded", "dead"]


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: EmailStr
    created_at: datetime


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class RegisterResponse(TokenResponse):
    # Returned exactly once. Only a hash is stored.
    api_key: str


class ApiKeyCreate(BaseModel):
    name: str = Field(default="Default", min_length=1, max_length=80)


class ApiKeyCreated(BaseModel):
    id: str
    name: str
    prefix: str
    key: str
    created_at: datetime


class ApiKeyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    prefix: str
    created_at: datetime
    last_used_at: datetime | None
    revoked_at: datetime | None


class EndpointCreate(BaseModel):
    url: HttpUrl
    description: str = Field(default="", max_length=255)
    event_types: list[str] = Field(default_factory=list, max_length=50)


class EndpointUpdate(BaseModel):
    url: HttpUrl | None = None
    description: str | None = Field(default=None, max_length=255)
    event_types: list[str] | None = Field(default=None, max_length=50)
    is_active: bool | None = None


class EndpointRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    url: str
    description: str
    secret: str
    is_active: bool
    event_types: list[str]
    created_at: datetime


class EventCreate(BaseModel):
    type: str = Field(
        default="ping",
        min_length=1,
        max_length=120,
        pattern=r"^[a-zA-Z0-9._:-]+$",
    )
    payload: dict[str, Any] = Field(default_factory=dict)


class EventRead(BaseModel):
    id: str
    type: str
    payload: dict[str, Any]
    created_at: datetime
    delivery_count: int
    succeeded_count: int
    pending_count: int
    dead_count: int


class AttemptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    attempt_number: int
    outcome: str
    status_code: int | None
    response_body: str | None
    error: str | None
    duration_ms: int
    attempted_at: datetime


class DeliveryRead(BaseModel):
    id: str
    event_id: str
    event_type: str
    endpoint_id: str
    endpoint_url: str
    status: DeliveryStatus
    attempts: int
    max_attempts: int
    next_attempt_at: datetime | None
    last_attempt_at: datetime | None
    response_status: int | None
    error: str | None
    duration_ms: int | None
    created_at: datetime
    completed_at: datetime | None


class DeliveryDetail(DeliveryRead):
    payload: dict[str, Any]
    attempt_log: list[AttemptRead]


class EventDetail(EventRead):
    deliveries: list[DeliveryRead]


class Stats(BaseModel):
    endpoints: int
    active_endpoints: int
    events_24h: int
    deliveries_24h: int
    pending: int
    dead: int
    succeeded_24h: int
    success_rate: float
    p95_latency_ms: int | None
