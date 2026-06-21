import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from core.schemas import (
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    MetricsResponse,
    ConversationListResponse,
    ConversationDetailResponse,
)
from conversation.history import ConversationStore
from ai.llm import chat, chat_stream
from ai.tracing import request_id_ctx
from storage import metrics as admin

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest, request: Request):
    request_id_ctx.set(request.state.request_id)
    store: ConversationStore = request.app.state.store
    history = store.get_messages(req.guest_id) if req.guest_id else []

    try:
        reply, new_messages = await chat(req.message, req.guest_id, request.app.state.context, history)
    except Exception as e:
        logger.exception("Chat failed")
        raise HTTPException(status_code=502, detail="LLM service unavailable") from e

    if req.guest_id:
        store.append(req.guest_id, new_messages)
    return ChatResponse(reply=reply)


@router.post("/chat/stream")
async def chat_stream_endpoint(req: ChatRequest, request: Request):
    store: ConversationStore = request.app.state.store
    history = store.get_messages(req.guest_id) if req.guest_id else []
    generator = chat_stream(
        req.message,
        req.guest_id,
        request.app.state.context,
        history,
        request_id=request.state.request_id,
        store=store,
    )
    return StreamingResponse(
        generator,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/history/{guest_id}", response_model=HistoryResponse)
async def get_history(guest_id: str, request: Request):
    store: ConversationStore = request.app.state.store
    return HistoryResponse(guest_id=guest_id, messages=store.get_visible(guest_id))


@router.get("/admin/metrics", response_model=MetricsResponse)
async def admin_metrics(request: Request):
    store: ConversationStore = request.app.state.store
    return MetricsResponse(**admin.build_metrics(store))


@router.get("/admin/conversations", response_model=ConversationListResponse)
async def admin_conversations(request: Request):
    store: ConversationStore = request.app.state.store
    rows = admin.list_conversations(store)
    return ConversationListResponse(count=len(rows), conversations=rows)


@router.get("/admin/conversations/{guest_id}", response_model=ConversationDetailResponse)
async def admin_conversation_detail(guest_id: str, request: Request):
    store: ConversationStore = request.app.state.store
    peeked = store.peek(guest_id)
    if peeked is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return ConversationDetailResponse(**admin.build_transcript(guest_id, peeked))
