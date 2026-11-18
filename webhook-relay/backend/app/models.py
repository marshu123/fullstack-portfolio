"""Database models.

Ids are random hex strings rather than integers: they appear in URLs, logs and
customer code, and sequential ids leak how much traffic the service handles.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .database import utcnow


def new_id() -> str:
    return uuid4().hex


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    endpoints: Mapped[list["Endpoint"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    api_keys: Mapped[list["ApiKey"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )


class ApiKey(Base):
    """An ingestion credential. Only the hash is stored, never the key itself."""

    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String(80), default="Default")
    prefix: Mapped[str] = mapped_column(String(16), index=True)
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    user: Mapped[User] = relationship(back_populates="api_keys")


class Endpoint(Base):
    """A destination URL owned by a user."""

    __tablename__ = "endpoints"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    url: Mapped[str] = mapped_column(String(2048))
    description: Mapped[str] = mapped_column(String(255), default="")
    secret: Mapped[str] = mapped_column(String(64))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # Empty list means "every event type".
    event_types: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    user: Mapped[User] = relationship(back_populates="endpoints")
    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="endpoint", cascade="all, delete-orphan"
    )

    def accepts(self, event_type: str) -> bool:
        return self.is_active and (
            not self.event_types or event_type in self.event_types
        )


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[str] = mapped_column(String(120), index=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)

    deliveries: Mapped[list["Delivery"]] = relationship(
        back_populates="event", cascade="all, delete-orphan"
    )


class Delivery(Base):
    """One event sent to one endpoint, with its own retry state."""

    __tablename__ = "deliveries"
    __table_args__ = (
        Index("ix_deliveries_due", "status", "next_attempt_at"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    event_id: Mapped[str] = mapped_column(
        ForeignKey("events.id", ondelete="CASCADE"), index=True
    )
    endpoint_id: Mapped[str] = mapped_column(
        ForeignKey("endpoints.id", ondelete="CASCADE"), index=True
    )

    # pending | delivering | succeeded | failed | dead
    status: Mapped[str] = mapped_column(String(16), default="pending", index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=6)
    next_attempt_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    last_attempt_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    response_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    event: Mapped[Event] = relationship(back_populates="deliveries")
    endpoint: Mapped[Endpoint] = relationship(back_populates="deliveries")
    attempts_log: Mapped[list["DeliveryAttempt"]] = relationship(
        back_populates="delivery",
        cascade="all, delete-orphan",
        order_by="DeliveryAttempt.attempt_number",
    )


class DeliveryAttempt(Base):
    """An immutable record of a single HTTP call."""

    __tablename__ = "delivery_attempts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=new_id)
    delivery_id: Mapped[str] = mapped_column(
        ForeignKey("deliveries.id", ondelete="CASCADE"), index=True
    )
    attempt_number: Mapped[int] = mapped_column(Integer)
    # success | http_error | timeout | network_error
    outcome: Mapped[str] = mapped_column(String(20))
    status_code: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_body: Mapped[str | None] = mapped_column(Text, nullable=True)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0)
    attempted_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    delivery: Mapped[Delivery] = relationship(back_populates="attempts_log")
