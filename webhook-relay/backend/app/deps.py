"""FastAPI dependencies: sessions, dashboard auth and ingestion auth."""

from __future__ import annotations

from collections.abc import Iterator
from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .config import Settings
from .database import utcnow
from .models import ApiKey, User
from .security import decode_access_token, hash_api_key

bearer_scheme = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_db(request: Request) -> Iterator[Session]:
    factory = request.app.state.session_factory
    session = factory()
    try:
        yield session
    finally:
        session.close()


DbSession = Annotated[Session, Depends(get_db)]
AppSettings = Annotated[Settings, Depends(get_settings)]


def _unauthorized(detail: str = "Not authenticated") -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    request: Request,
    db: DbSession,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None, Depends(bearer_scheme)
    ] = None,
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    settings: Settings = request.app.state.settings
    try:
        subject = decode_access_token(credentials.credentials, settings.jwt_secret)
    except jwt.PyJWTError:
        raise _unauthorized("Invalid or expired token")

    user = db.get(User, subject)
    if user is None:
        raise _unauthorized("User no longer exists")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]


def get_api_key_user(
    request: Request,
    db: DbSession,
    x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None,
) -> User:
    if not x_api_key:
        raise _unauthorized("Missing X-API-Key")

    key = db.query(ApiKey).filter(ApiKey.key_hash == hash_api_key(x_api_key)).first()
    if key is None or key.revoked_at is not None:
        raise _unauthorized("Invalid API key")

    key.last_used_at = utcnow()
    db.commit()

    return key.user


IngestUser = Annotated[User, Depends(get_api_key_user)]
