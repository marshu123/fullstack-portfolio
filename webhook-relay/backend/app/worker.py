"""Background delivery worker.

Claims due deliveries, sends them concurrently, and reschedules failures with
exponential backoff. Claimed rows get a short lease (``next_attempt_at`` pushed
into the future) so a crashed process does not strand work forever: the row
becomes due again when the lease expires.

One worker per process is the supported setup. On PostgreSQL the claim query
uses ``FOR UPDATE SKIP LOCKED``, so running several processes is safe; on
SQLite it is not, which is documented rather than pretended away.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import timedelta

import httpx
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload, selectinload

from .config import Settings
from .database import utcnow
from .delivery import attempt_delivery
from .models import Delivery

logger = logging.getLogger("relay.worker")


class DeliveryWorker:
    def __init__(
        self,
        session_factory,
        settings: Settings,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._session_factory = session_factory
        self._settings = settings
        self._transport = transport
        self._client: httpx.AsyncClient | None = None
        self._stop = asyncio.Event()

    async def _ensure_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                transport=self._transport,
                timeout=self._settings.request_timeout_seconds,
                follow_redirects=False,
            )
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    def stop(self) -> None:
        self._stop.set()

    def _requeue_stale(self) -> None:
        """Recover rows left mid-flight by a previous process."""
        with self._session_factory() as session:
            result = session.execute(
                update(Delivery)
                .where(Delivery.status == "delivering")
                .values(status="pending", next_attempt_at=utcnow())
            )
            session.commit()
            if result.rowcount:
                logger.info("requeued %s stale deliveries", result.rowcount)

    def _recover_expired_leases(self) -> None:
        """Return rows whose claim lease ran out to the pending queue.

        A worker that dies mid-request never clears its claim. The lease is what
        keeps that row from being stuck in ``delivering`` forever.
        """
        now = utcnow()
        with self._session_factory() as session:
            session.execute(
                update(Delivery)
                .where(
                    Delivery.status == "delivering",
                    Delivery.next_attempt_at.is_not(None),
                    Delivery.next_attempt_at <= now,
                )
                .values(status="pending", next_attempt_at=now)
            )
            session.commit()

    def _claim_due(self) -> list[str]:
        self._recover_expired_leases()
        now = utcnow()
        with self._session_factory() as session:
            statement = (
                select(Delivery)
                .where(
                    Delivery.status == "pending",
                    Delivery.next_attempt_at.is_not(None),
                    Delivery.next_attempt_at <= now,
                )
                .order_by(Delivery.next_attempt_at)
                .limit(self._settings.worker_batch_size)
            )
            if session.get_bind().dialect.name == "postgresql":
                statement = statement.with_for_update(skip_locked=True)

            deliveries = session.scalars(statement).all()
            ids: list[str] = []
            for delivery in deliveries:
                delivery.status = "delivering"
                delivery.next_attempt_at = now + timedelta(
                    seconds=self._settings.claim_lease_seconds
                )
                ids.append(delivery.id)
            session.commit()
        return ids

    async def _deliver_one(self, delivery_id: str, semaphore: asyncio.Semaphore) -> None:
        client = await self._ensure_client()
        async with semaphore:
            with self._session_factory() as session:
                delivery = session.scalar(
                    select(Delivery)
                    .where(Delivery.id == delivery_id)
                    .options(
                        joinedload(Delivery.endpoint),
                        selectinload(Delivery.event),
                    )
                )
                if delivery is None:
                    return
                try:
                    await attempt_delivery(session, delivery, client, self._settings)
                except Exception:
                    logger.exception("delivery %s failed unexpectedly", delivery_id)
                    session.rollback()
                    # Put it back rather than leaving it stuck in "delivering".
                    with self._session_factory() as retry_session:
                        retry_session.execute(
                            update(Delivery)
                            .where(Delivery.id == delivery_id)
                            .values(status="pending", next_attempt_at=utcnow())
                        )
                        retry_session.commit()

    async def tick(self) -> int:
        """Process one batch. Returns how many deliveries were attempted."""
        ids = self._claim_due()
        if not ids:
            return 0

        semaphore = asyncio.Semaphore(self._settings.worker_concurrency)
        await asyncio.gather(*(self._deliver_one(delivery_id, semaphore) for delivery_id in ids))
        return len(ids)

    async def run(self) -> None:
        self._requeue_stale()
        while not self._stop.is_set():
            try:
                processed = await self.tick()
            except Exception:
                logger.exception("worker tick failed")
                processed = 0

            if processed:
                continue
            try:
                await asyncio.wait_for(
                    self._stop.wait(), timeout=self._settings.worker_poll_seconds
                )
            except asyncio.TimeoutError:
                pass

        await self.close()
