from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..database import utcnow
from ..deps import CurrentUser, DbSession
from ..models import ApiKey
from ..schemas import ApiKeyCreate, ApiKeyCreated, ApiKeyRead
from ..security import generate_api_key

router = APIRouter(prefix="/api/keys", tags=["api keys"])


@router.get("", response_model=list[ApiKeyRead])
def list_keys(user: CurrentUser, db: DbSession) -> list[ApiKeyRead]:
    keys = db.scalars(
        select(ApiKey)
        .where(ApiKey.user_id == user.id)
        .order_by(ApiKey.created_at.desc())
    ).all()
    return [ApiKeyRead.model_validate(key) for key in keys]


@router.post("", response_model=ApiKeyCreated, status_code=status.HTTP_201_CREATED)
def create_key(
    payload: ApiKeyCreate, user: CurrentUser, db: DbSession
) -> ApiKeyCreated:
    full_key, prefix, key_hash = generate_api_key()
    key = ApiKey(
        user_id=user.id,
        name=payload.name,
        prefix=prefix,
        key_hash=key_hash,
    )
    db.add(key)
    db.commit()
    db.refresh(key)

    return ApiKeyCreated(
        id=key.id,
        name=key.name,
        prefix=key.prefix,
        key=full_key,
        created_at=key.created_at,
    )


@router.delete(
    "/{key_id}", status_code=status.HTTP_204_NO_CONTENT, response_model=None
)
def revoke_key(key_id: str, user: CurrentUser, db: DbSession) -> None:
    key = db.scalar(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == user.id)
    )
    if key is None:
        raise HTTPException(status_code=404, detail="API key not found")
    if key.revoked_at is None:
        key.revoked_at = utcnow()
        db.commit()
