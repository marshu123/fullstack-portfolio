"""Engine and session construction.

The service stores timestamps as naive UTC datetimes. SQLite has no timezone
type, and mixing aware and naive values across SQLite and PostgreSQL is a bug
waiting to happen, so UTC-everywhere is enforced at the boundary.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Engine, create_engine, event
from sqlalchemy.orm import sessionmaker

from .config import Settings


def utcnow() -> datetime:
    """Current UTC time as a naive datetime."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def make_engine(settings: Settings) -> Engine:
    url = settings.database_url
    kwargs: dict = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}

    engine = create_engine(url, **kwargs)

    if url.startswith("sqlite"):
        # SQLite ignores FOREIGN KEY constraints unless asked, and the cascade
        # deletes in the schema depend on them.
        @event.listens_for(engine, "connect")
        def _enable_foreign_keys(dbapi_connection, _record):  # pragma: no cover
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


def make_session_factory(engine: Engine) -> sessionmaker:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
