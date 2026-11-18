from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


def register(client: TestClient, email: str) -> dict:
    response = client.post(
        "/api/auth/register",
        json={"email": email, "password": "correct-horse-battery"},
    )
    assert response.status_code == 201, response.text
    body = response.json()
    return {
        "headers": {"Authorization": f"Bearer {body['access_token']}"},
        "api_key": body["api_key"],
        "user": body["user"],
    }


def test_register_login_and_me(client):
    account = register(client, "dev@example.com")
    assert account["api_key"].startswith("relay_live_")
    assert account["user"]["email"] == "dev@example.com"

    # The password hash is never serialised.
    assert "password" not in account["user"]

    me = client.get("/api/auth/me", headers=account["headers"])
    assert me.status_code == 200
    assert me.json()["id"] == account["user"]["id"]

    login = client.post(
        "/api/auth/login",
        json={"email": "dev@example.com", "password": "correct-horse-battery"},
    )
    assert login.status_code == 200
    assert login.json()["access_token"]


def test_duplicate_email_is_rejected(client):
    register(client, "dev@example.com")
    response = client.post(
        "/api/auth/register",
        json={"email": "dev@example.com", "password": "correct-horse-battery"},
    )
    assert response.status_code == 409


def test_login_wrong_password_is_401(client):
    register(client, "dev@example.com")
    response = client.post(
        "/api/auth/login",
        json={"email": "dev@example.com", "password": "not-the-password"},
    )
    assert response.status_code == 401


def test_dashboard_requires_a_token(client):
    assert client.get("/api/endpoints").status_code == 401
    assert client.get("/api/events").status_code == 401
    assert client.get("/api/stats").status_code == 401


def test_short_password_is_rejected(client):
    response = client.post(
        "/api/auth/register",
        json={"email": "dev@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_endpoint_lifecycle(client, account):
    headers = account["headers"]
    created = client.post(
        "/api/endpoints",
        headers=headers,
        json={
            "url": "https://example.com/hooks/orders",
            "description": "Orders service",
            "event_types": ["order.paid"],
        },
    )
    assert created.status_code == 201, created.text
    endpoint = created.json()
    assert endpoint["secret"].startswith("whsec_")
    assert endpoint["is_active"] is True
    assert endpoint["event_types"] == ["order.paid"]

    listed = client.get("/api/endpoints", headers=headers).json()
    assert [item["id"] for item in listed] == [endpoint["id"]]

    paused = client.patch(
        f"/api/endpoints/{endpoint['id']}",
        headers=headers,
        json={"is_active": False, "description": "Paused while migrating"},
    )
    assert paused.status_code == 200
    assert paused.json()["is_active"] is False
    assert paused.json()["description"] == "Paused while migrating"
    # Rotating and pausing must not quietly reset the subscription list.
    assert paused.json()["event_types"] == ["order.paid"]

    rotated = client.post(
        f"/api/endpoints/{endpoint['id']}/rotate-secret", headers=headers
    )
    assert rotated.status_code == 200
    assert rotated.json()["secret"] != endpoint["secret"]

    deleted = client.delete(f"/api/endpoints/{endpoint['id']}", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/api/endpoints", headers=headers).json() == []


def test_endpoints_are_scoped_to_their_owner(client):
    first = register(client, "first@example.com")
    second = register(client, "second@example.com")

    endpoint = client.post(
        "/api/endpoints",
        headers=first["headers"],
        json={"url": "https://example.com/hook"},
    ).json()

    for method, url in (
        ("patch", f"/api/endpoints/{endpoint['id']}"),
        ("delete", f"/api/endpoints/{endpoint['id']}"),
        ("post", f"/api/endpoints/{endpoint['id']}/rotate-secret"),
        ("post", f"/api/endpoints/{endpoint['id']}/test"),
    ):
        kwargs = {"json": {}} if method == "patch" else {}
        response = getattr(client, method)(url, headers=second["headers"], **kwargs)
        assert response.status_code == 404, (method, url, response.text)


def test_event_fans_out_only_to_matching_endpoints(client, account):
    headers = account["headers"]
    client.post(
        "/api/endpoints",
        headers=headers,
        json={"url": "https://example.com/all"},
    )
    client.post(
        "/api/endpoints",
        headers=headers,
        json={"url": "https://example.com/orders", "event_types": ["order.paid"]},
    )
    paused = client.post(
        "/api/endpoints",
        headers=headers,
        json={"url": "https://example.com/paused"},
    ).json()
    client.patch(
        f"/api/endpoints/{paused['id']}", headers=headers, json={"is_active": False}
    )

    order_event = client.post(
        "/api/events",
        headers=headers,
        json={"type": "order.paid", "payload": {"amount": 10}},
    )
    assert order_event.status_code == 201
    assert order_event.json()["delivery_count"] == 2

    other_event = client.post(
        "/api/events",
        headers=headers,
        json={"type": "user.created", "payload": {"id": 1}},
    ).json()
    assert other_event["delivery_count"] == 1


def test_ingest_accepts_api_key_and_rejects_revoked_keys(client, account):
    headers = account["headers"]
    client.post(
        "/api/endpoints", headers=headers, json={"url": "https://example.com/hook"}
    )

    accepted = client.post(
        "/api/ingest",
        headers={"X-API-Key": account["api_key"]},
        json={"type": "order.paid", "payload": {"amount": 1}},
    )
    assert accepted.status_code == 201

    assert (
        client.post("/api/ingest", json={"type": "x", "payload": {}}).status_code
        == 401
    )

    created = client.post(
        "/api/keys", headers=headers, json={"name": "CI"}
    ).json()
    assert created["key"].startswith("relay_live_")
    assert created["key"].startswith(created["prefix"])

    # The full key is returned once; listing only exposes the prefix.
    listed = client.get("/api/keys", headers=headers).json()
    assert all("key" not in item for item in listed)
    assert any(item["prefix"] == created["prefix"] for item in listed)

    revoked = client.delete(f"/api/keys/{created['id']}", headers=headers)
    assert revoked.status_code == 204

    rejected = client.post(
        "/api/ingest",
        headers={"X-API-Key": created["key"]},
        json={"type": "order.paid", "payload": {}},
    )
    assert rejected.status_code == 401


def test_event_detail_and_404_for_other_users(client):
    first = register(client, "first@example.com")
    second = register(client, "second@example.com")
    event = client.post(
        "/api/events",
        headers=first["headers"],
        json={"type": "order.paid", "payload": {"amount": 5}},
    ).json()

    assert (
        client.get(f"/api/events/{event['id']}", headers=first["headers"]).status_code
        == 200
    )
    assert (
        client.get(f"/api/events/{event['id']}", headers=second["headers"]).status_code
        == 404
    )


def test_stats_start_at_zero(client, account):
    stats = client.get("/api/stats", headers=account["headers"]).json()
    assert stats == {
        "endpoints": 0,
        "active_endpoints": 0,
        "events_24h": 0,
        "deliveries_24h": 0,
        "pending": 0,
        "dead": 0,
        "succeeded_24h": 0,
        "success_rate": 0.0,
        "p95_latency_ms": None,
    }


def test_paused_endpoint_cannot_be_tested(client, account):
    headers = account["headers"]
    endpoint = client.post(
        "/api/endpoints", headers=headers, json={"url": "https://example.com/hook"}
    ).json()
    client.patch(
        f"/api/endpoints/{endpoint['id']}", headers=headers, json={"is_active": False}
    )

    response = client.post(
        f"/api/endpoints/{endpoint['id']}/test", headers=headers
    )
    assert response.status_code == 409


def test_bad_event_type_is_rejected(client, account):
    response = client.post(
        "/api/events",
        headers=account["headers"],
        json={"type": "order paid!", "payload": {}},
    )
    assert response.status_code == 422
