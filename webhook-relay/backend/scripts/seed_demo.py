"""Seed a local demo account, endpoints and events.

Start the API and scripts/demo_receiver.py first, then:

    python scripts/seed_demo.py

Prints the dashboard credentials and an ingestion key.
"""

from __future__ import annotations

import os
import time

import httpx

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")
RECEIVER_URL = os.getenv("RECEIVER_URL", "http://127.0.0.1:9100")
EMAIL = os.getenv("DEMO_EMAIL", "demo@relay.dev")
PASSWORD = os.getenv("DEMO_PASSWORD", "relay-demo-pass")

ENDPOINTS = [
    {
        "url": f"{RECEIVER_URL}/ok",
        "description": "Orders service",
        "event_types": ["order.paid", "order.refunded"],
    },
    {
        "url": f"{RECEIVER_URL}/flaky",
        "description": "Inventory (unstable)",
        "event_types": [],
    },
    {
        "url": f"{RECEIVER_URL}/fail",
        "description": "Legacy CRM",
        "event_types": [],
    },
]

EVENTS = [
    ("order.paid", {"order_id": "ord_1042", "amount": 49900, "currency": "INR"}),
    ("user.created", {"user_id": "usr_88", "email": "new@example.com"}),
    ("order.paid", {"order_id": "ord_1043", "amount": 129900, "currency": "INR"}),
    ("invoice.payment_failed", {"invoice_id": "inv_9", "attempt": 3}),
    ("order.refunded", {"order_id": "ord_1042", "amount": 49900}),
    ("user.created", {"user_id": "usr_89", "email": "second@example.com"}),
    ("order.paid", {"order_id": "ord_1044", "amount": 2500, "currency": "INR"}),
]


def main() -> None:
    with httpx.Client(base_url=API_URL, timeout=15) as client:
        response = client.post(
            "/api/auth/register", json={"email": EMAIL, "password": PASSWORD}
        )
        if response.status_code == 409:
            response = client.post(
                "/api/auth/login", json={"email": EMAIL, "password": PASSWORD}
            )
            response.raise_for_status()
            token = response.json()["access_token"]
            key_response = client.post(
                "/api/keys",
                headers={"Authorization": f"Bearer {token}"},
                json={"name": "Demo ingestion"},
            )
            key_response.raise_for_status()
            api_key = key_response.json()["key"]
            print("Existing demo account — issued a fresh API key.")
        else:
            response.raise_for_status()
            token = response.json()["access_token"]
            api_key = response.json()["api_key"]

        headers = {"Authorization": f"Bearer {token}"}
        existing = client.get("/api/endpoints", headers=headers).json()
        if not existing:
            for endpoint in ENDPOINTS:
                created = client.post("/api/endpoints", headers=headers, json=endpoint)
                created.raise_for_status()
            print(f"Created {len(ENDPOINTS)} endpoints.")

        for event_type, payload in EVENTS:
            sent = client.post(
                "/api/events",
                headers=headers,
                json={"type": event_type, "payload": payload},
            )
            sent.raise_for_status()
            time.sleep(0.4)

    print()
    print("Demo ready")
    print(f"  URL:      http://localhost:5173")
    print(f"  Email:    {EMAIL}")
    print(f"  Password: {PASSWORD}")
    print(f"  API key:  {api_key}")
    print()
    print("Give the worker ~20s so the flaky receiver can recover on retry.")


if __name__ == "__main__":
    main()
