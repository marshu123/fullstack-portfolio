from __future__ import annotations

import asyncio
from datetime import timedelta

import httpx
from sqlalchemy import select

from app.database import utcnow
from app.models import Delivery
from app.signing import verify
from app.worker import DeliveryWorker


def make_endpoint(client, headers, *, url="https://receiver.test/hook", event_types=None):
    response = client.post(
        "/api/endpoints",
        headers=headers,
        json={"url": url, "event_types": event_types or []},
    )
    assert response.status_code == 201, response.text
    return response.json()


def make_event(client, headers, event_type="order.paid"):
    response = client.post(
        "/api/events",
        headers=headers,
        json={"type": event_type, "payload": {"amount": 499, "currency": "INR"}},
    )
    assert response.status_code == 201, response.text
    return response.json()


def only_delivery(client, headers) -> dict:
    response = client.get("/api/deliveries", headers=headers)
    assert response.status_code == 200
    deliveries = response.json()
    assert len(deliveries) == 1, deliveries
    return deliveries[0]


def make_due(app, delivery_id: str) -> None:
    with app.state.session_factory() as session:
        delivery = session.scalar(select(Delivery).where(Delivery.id == delivery_id))
        delivery.next_attempt_at = utcnow()
        session.commit()


def test_retry_then_success_and_replay(app, client, account, settings):
    headers = account["headers"]
    endpoint = make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    calls: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if len(calls) == 1:
            return httpx.Response(500, text="receiver on fire")
        return httpx.Response(200, text='{"received":true}')

    worker = DeliveryWorker(
        app.state.session_factory, settings, transport=httpx.MockTransport(handler)
    )

    async def run() -> None:
        assert await worker.tick() == 1
        make_due(app, delivery["id"])
        assert await worker.tick() == 1
        await worker.close()

    asyncio.run(run())

    # The first request carried a signature that verifies against the endpoint secret.
    header = calls[0].headers["x-relay-signature"]
    assert verify(endpoint["secret"], header, calls[0].content)
    assert calls[0].headers["x-relay-event"] == "order.paid"
    assert calls[0].headers["x-relay-attempt"] == "1"
    assert calls[1].headers["x-relay-attempt"] == "2"

    detail = client.get(f"/api/deliveries/{delivery['id']}", headers=headers).json()
    assert detail["status"] == "succeeded"
    assert detail["attempts"] == 2
    assert detail["response_status"] == 200
    assert [attempt["outcome"] for attempt in detail["attempt_log"]] == [
        "http_error",
        "success",
    ]
    assert detail["attempt_log"][0]["status_code"] == 500

    # Replaying writes a new delivery instead of rewriting the original.
    replay = client.post(
        f"/api/deliveries/{delivery['id']}/replay", headers=headers
    )
    assert replay.status_code == 201, replay.text
    replay_body = replay.json()
    assert replay_body["id"] != delivery["id"]
    assert replay_body["status"] == "pending"
    assert replay_body["attempts"] == 0

    with app.state.session_factory() as session:
        original = session.scalar(
            select(Delivery).where(Delivery.id == delivery["id"])
        )
        assert original.attempts == 2


def test_delivery_goes_dead_after_max_attempts(app, client, account, settings):
    headers = account["headers"]
    make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    worker = DeliveryWorker(
        app.state.session_factory,
        settings,
        transport=httpx.MockTransport(lambda request: httpx.Response(503)),
    )

    async def run() -> None:
        for attempt in range(1, settings.max_attempts + 1):
            assert await worker.tick() == 1
            if attempt < settings.max_attempts:
                make_due(app, delivery["id"])
        await worker.close()

    asyncio.run(run())

    detail = client.get(f"/api/deliveries/{delivery['id']}", headers=headers).json()
    assert detail["status"] == "dead"
    assert detail["attempts"] == settings.max_attempts
    assert len(detail["attempt_log"]) == settings.max_attempts
    assert detail["next_attempt_at"] is None
    assert detail["completed_at"] is not None

    stats = client.get("/api/stats", headers=headers).json()
    assert stats["dead"] == 1
    assert stats["pending"] == 0


def test_network_error_is_recorded(app, client, account, settings):
    headers = account["headers"]
    make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection refused", request=request)

    worker = DeliveryWorker(
        app.state.session_factory, settings, transport=httpx.MockTransport(handler)
    )

    async def run() -> None:
        await worker.tick()
        await worker.close()

    asyncio.run(run())

    detail = client.get(f"/api/deliveries/{delivery['id']}", headers=headers).json()
    assert detail["status"] == "pending"
    assert detail["attempt_log"][0]["outcome"] == "network_error"
    assert "connection refused" in detail["attempt_log"][0]["error"]


def test_redirects_are_not_followed(app, client, account, settings):
    headers = account["headers"]
    make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    worker = DeliveryWorker(
        app.state.session_factory,
        settings,
        transport=httpx.MockTransport(
            lambda request: httpx.Response(302, headers={"Location": "/elsewhere"})
        ),
    )

    async def run() -> None:
        await worker.tick()
        await worker.close()

    asyncio.run(run())

    detail = client.get(f"/api/deliveries/{delivery['id']}", headers=headers).json()
    # A redirect is not a 2xx; silently following it could POST the payload
    # somewhere the endpoint owner never configured.
    assert detail["status"] == "pending"
    assert detail["response_status"] == 302


def test_expired_claim_lease_is_recovered(app, client, account, settings):
    headers = account["headers"]
    make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    with app.state.session_factory() as session:
        row = session.scalar(select(Delivery).where(Delivery.id == delivery["id"]))
        row.status = "delivering"
        row.next_attempt_at = utcnow() - timedelta(seconds=1)
        session.commit()

    worker = DeliveryWorker(
        app.state.session_factory,
        settings,
        transport=httpx.MockTransport(lambda request: httpx.Response(200)),
    )

    async def run() -> None:
        assert await worker.tick() == 1
        await worker.close()

    asyncio.run(run())

    detail = client.get(f"/api/deliveries/{delivery['id']}", headers=headers).json()
    assert detail["status"] == "succeeded"
    assert detail["attempts"] == 1


def test_replay_rejected_while_in_flight(app, client, account):
    headers = account["headers"]
    make_endpoint(client, headers)
    make_event(client, headers)
    delivery = only_delivery(client, headers)

    response = client.post(
        f"/api/deliveries/{delivery['id']}/replay", headers=headers
    )
    assert response.status_code == 409
