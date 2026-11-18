"""Password hashing, JWT access tokens and API-key generation.

Passwords use PBKDF2-HMAC-SHA256 from the standard library so the service has
no native build dependency. API keys are random, shown once, and stored as
SHA-256 hashes — a leaked database does not yield working credentials.
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import time
from typing import Any

import jwt

PBKDF2_ITERATIONS = 310_000
API_KEY_PREFIX = "relay_live_"


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("ascii"), PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${digest.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, iterations, salt, expected = encoded.split("$", 3)
    except ValueError:
        return False
    if algorithm != "pbkdf2_sha256":
        return False
    digest = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("ascii"), int(iterations)
    )
    return hmac.compare_digest(digest.hex(), expected)


def create_access_token(
    subject: str, secret: str, expires_minutes: int, now: float | None = None
) -> str:
    issued_at = int(now if now is not None else time.time())
    payload: dict[str, Any] = {
        "sub": subject,
        "iat": issued_at,
        "exp": issued_at + expires_minutes * 60,
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_access_token(token: str, secret: str) -> str:
    """Return the subject, or raise jwt.PyJWTError."""
    payload = jwt.decode(token, secret, algorithms=["HS256"])
    subject = payload.get("sub")
    if not isinstance(subject, str) or not subject:
        raise jwt.InvalidTokenError("Token has no subject")
    return subject


def generate_api_key() -> tuple[str, str, str]:
    """Return (full_key, prefix, sha256_hash)."""
    full_key = API_KEY_PREFIX + secrets.token_urlsafe(32)
    return full_key, full_key[:16], hash_api_key(full_key)


def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def generate_signing_secret() -> str:
    return "whsec_" + secrets.token_urlsafe(24)
