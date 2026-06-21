import asyncio
import logging
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from context_loader import load_context
from services import close_client
from history import ConversationStore
from llm import close_llm_client
from routes import router
from services.parrot.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s level=%(levelname)s logger=%(name)s %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.context = load_context(settings.context_dir)
    logger.info("Loaded context (%d chars)", len(app.state.context))
    app.state.store = ConversationStore(
        max_messages=settings.max_history_messages,
        ttl_seconds=settings.conversation_ttl,
    )
    cleanup_task = asyncio.create_task(_run_cleanup(app.state.store))
    yield
    cleanup_task.cancel()
    await close_client()
    await close_llm_client()


async def _run_cleanup(store: ConversationStore):
    while True:
        await asyncio.sleep(60)
        store.cleanup()


async def request_context(request: Request, call_next):
    rid = request.headers.get("X-Request-ID") or uuid.uuid4().hex[:12]
    request.state.request_id = rid
    start = time.perf_counter()
    response = await call_next(request)
    logger.info(
        "rid=%s method=%s path=%s status=%s dur_ms=%.1f",
        rid, request.method, request.url.path, response.status_code,
        (time.perf_counter() - start) * 1000,
    )
    response.headers["X-Request-ID"] = rid
    return response


def create_app() -> FastAPI:
    app = FastAPI(title="Parrot Chat Service", lifespan=lifespan)
    app.middleware("http")(request_context)
    app.include_router(router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.port)
