"""Application factory."""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .config import Settings
from .database import make_engine, make_session_factory
from .models import Base
from .routers import auth, deliveries, endpoints, events, keys
from .worker import DeliveryWorker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("relay")


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()

    engine = make_engine(settings)
    session_factory = make_session_factory(engine)
    Base.metadata.create_all(bind=engine)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        worker: DeliveryWorker | None = None
        task: asyncio.Task | None = None

        if settings.run_worker:
            worker = DeliveryWorker(session_factory, settings)
            task = asyncio.create_task(worker.run(), name="relay-worker")
            app.state.worker = worker
            logger.info(
                "worker started: poll=%ss concurrency=%s",
                settings.worker_poll_seconds,
                settings.worker_concurrency,
            )

        try:
            yield
        finally:
            if worker is not None:
                worker.stop()
            if task is not None:
                try:
                    await asyncio.wait_for(task, timeout=15)
                except asyncio.TimeoutError:
                    task.cancel()
            engine.dispose()

    app = FastAPI(
        title="Relay API",
        description="Signed webhook delivery with retries, attempt logs and replay.",
        version=__version__,
        lifespan=lifespan,
    )

    app.state.settings = settings
    app.state.engine = engine
    app.state.session_factory = session_factory

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth.router)
    app.include_router(keys.router)
    app.include_router(endpoints.router)
    app.include_router(events.router)
    app.include_router(deliveries.router)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok", "version": __version__}

    return app


app = create_app()
