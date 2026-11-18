"""HMAC request signatures for receivers.

Header format:

    X-Relay-Signature: t=<unix seconds>,v1=<hex hmac-sha256>

The signed content is ``<t>.<raw request body>``. Receivers must verify the
signature against the raw bytes they received, not against re-serialised JSON.
"""

from __future__ import annotations

import hashlib
import hmac
import time

SIGNATURE_HEADER = "X-Relay-Signature"
SIGNATURE_VERSION = "v1"


def compute_signature(secret: str, timestamp: int, body: bytes) -> str:
    message = f"{timestamp}.".encode("utf-8") + body
    return hmac.new(secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def sign(secret: str, body: bytes, timestamp: int | None = None) -> str:
    ts = int(time.time()) if timestamp is None else int(timestamp)
    return f"t={ts},{SIGNATURE_VERSION}={compute_signature(secret, ts, body)}"


def parse_signature_header(header: str) -> tuple[int, str] | None:
    parts = {}
    for chunk in header.split(","):
        if "=" not in chunk:
            return None
        key, value = chunk.split("=", 1)
        parts[key.strip()] = value.strip()

    timestamp = parts.get("t")
    signature = parts.get(SIGNATURE_VERSION)
    if timestamp is None or signature is None:
        return None
    try:
        return int(timestamp), signature
    except ValueError:
        return None


def verify(
    secret: str,
    header: str | None,
    body: bytes,
    tolerance_seconds: int = 300,
    now: float | None = None,
) -> bool:
    """Constant-time verification with a replay window."""
    if not header:
        return False

    parsed = parse_signature_header(header)
    if parsed is None:
        return False

    timestamp, received = parsed
    current = time.time() if now is None else now
    if abs(current - timestamp) > tolerance_seconds:
        return False

    expected = compute_signature(secret, timestamp, body)
    return hmac.compare_digest(expected, received)
