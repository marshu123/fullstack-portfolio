from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from ..config import Settings
from ..deps import AppSettings, CurrentUser, DbSession
from ..models import ApiKey, User
from ..schemas import (
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserRead,
)
from ..security import (
    create_access_token,
    generate_api_key,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _token_for(user: User, settings: Settings) -> str:
    return create_access_token(
        user.id, settings.jwt_secret, settings.jwt_expiry_minutes
    )


@router.post(
    "/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED
)
def register(
    payload: RegisterRequest, db: DbSession, settings: AppSettings
) -> RegisterResponse:
    email = payload.email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists",
        )

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()

    full_key, prefix, key_hash = generate_api_key()
    db.add(
        ApiKey(
            user_id=user.id,
            name="Default",
            prefix=prefix,
            key_hash=key_hash,
        )
    )
    db.commit()
    db.refresh(user)

    return RegisterResponse(
        access_token=_token_for(user, settings),
        user=UserRead.model_validate(user),
        api_key=full_key,
    )


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest, db: DbSession, settings: AppSettings
) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    # Same message for "no such user" and "wrong password" on purpose.
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenResponse(
        access_token=_token_for(user, settings),
        user=UserRead.model_validate(user),
    )


@router.get("/me", response_model=UserRead)
def me(user: CurrentUser) -> UserRead:
    return UserRead.model_validate(user)
