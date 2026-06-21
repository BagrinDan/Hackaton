"""Admin metrics helpers for the parrot service."""
import json

import logging
from history import ConversationStore
from services.parrot.storage.metrics import Metrics
from conv_sum import ConversationSummary
from llm import FALLBACK
from profanity import contains_mask
from dataclasses import asdict

_ERROR_KEY = "error"
logger = logging.getLogger(__name__)


def _has_error_marker(value) -> bool:
    """Recursively detect an {"error": ...} marker anywhere in a parsed value.

    Needed because get_guest_journey_status nests errors under per-leg keys
    (e.g. {"reservation": {"error": "unavailable"}}), not just at the top level.
    """
    if isinstance(value, dict):
        if _ERROR_KEY in value:
            return True
        return any(_has_error_marker(v) for v in value.values())
    if isinstance(value, list):
        return any(_has_error_marker(v) for v in value)
    return False


def _tool_result_is_error(content) -> bool:
    """A tool message's content is a JSON string; parse it and scan for errors.

    Non-string or non-JSON content is treated as non-error (defensive)."""
    if not isinstance(content, str):
        return False
    try:
        parsed = json.loads(content)
    except (json.JSONDecodeError, ValueError):
        return False
    return _has_error_marker(parsed)


def summarize_conversation(messages: list[dict]) -> ConversationSummary: # Вот туть добавил отдельный класс ConversationSummary: слишком много атрибутов
    """Per-conversation summary derived purely from a raw message list."""
    s = ConversationSummary(total_messages=len(messages))

    for m in messages:
        role = m.get("role")
        if role == "user":
            s.turns += 1
            if contains_mask(m.get("content")):
                s.censored_count += 1
        elif role == "assistant":
            calls = m.get("tool_calls")
            if calls:
                for tc in calls:
                    name = (tc.get("function") or {}).get("name") or "unknown"
                    s.tool_calls_by_name[name] = s.tool_calls_by_name.get(name, 0) + 1
                    s.tool_calls_total += 1
            else:
                s.assistant_turns += 1
                if m.get("content") == FALLBACK:
                    s.fallback_count += 1
        elif role == "tool":
            if _tool_result_is_error(m.get("content")):
                s.tool_errors += 1

    return s

def build_metrics(store: ConversationStore) -> Metrics: # А тут уже отдельный класс Metrics, т.к слишком много атрибутов
    """Aggregate metrics across the whole current in-memory window."""
    snap = store.snapshot()
    m = Metrics(
        total_conversations=len(snap),
        max_conversations=store.max_conversations,
    )

    for entry in snap.values():
        s = summarize_conversation(entry["messages"])
        m.total_messages += s.get("total_messages", 0)
        m.total_user_turns += s.get("turns", 0)
        m.total_assistant_turns += s.get("assistant_turns", 0)
        m.tool_calls_total += s.get("tool_calls_total", 0)
        m.tool_errors_total += s.get("tool_errors", 0)
        m.fallback_total += s.get("fallback_count", 0)
        m.censored_messages_total += s.get("censored_count", 0)

        for name, n in s.get("tool_calls_by_name", {}).items():
            m.tool_calls_by_name[name] = m.tool_calls_by_name.get(name, 0) + n

        if s.get("has_fallback"):
            m.conversations_with_fallback += 1
        if s.get("has_tool_error"):
            m.conversations_with_tool_error += 1
        if s.get("has_censored"):
            m.conversations_with_censored += 1

    return m


def list_conversations(store: ConversationStore) -> list[dict]:
    """Per-conversation rows (guest_id + last_accessed + flattened summary).

    Sorted newest-activity-first so the admin list surfaces the most recently
    active sessions — and their has_fallback / has_tool_error health flags —
    without a per-conversation detail fetch.
    """
    snap = store.snapshot()
    rows = [
        {
            "guest_id": guest_id,
            "last_accessed": entry["last_accessed"],
            **asdict(summarize_conversation(entry["messages"]))
        }
        for guest_id, entry in snap.items()
    ]
    rows.sort(key=lambda r: r["last_accessed"], reverse=True)
    return rows


def _normalize_message(m: dict, id_to_name: dict[str, str]) -> dict:
    role = m.get("role")
    out: dict = {"role": role, "content": m.get("content")}
    calls = m.get("tool_calls")
    if calls:
        out["tool_calls"] = [
            {
                "id": tc.get("id"),
                "name": (tc.get("function") or {}).get("name"),
                "arguments": (tc.get("function") or {}).get("arguments"),
            }
            for tc in calls
        ]
    if role == "tool":
        tcid = m.get("tool_call_id")
        out["tool_call_id"] = tcid
        out["name"] = id_to_name.get(tcid)
    return out

def normalize_transcript(messages: list[dict]) -> list[dict]:
    """Convert raw stored OpenAI messages into a uniform, frontend-friendly shape.
    Every entry keeps top-level ``role`` + ``content`` (content is null when
    absent — e.g. an assistant turn that only made tool calls) so the frontend
    renders text turns exactly like GET /history. Tool activity is preserved but
    flattened: assistant ``tool_calls`` become {id, name, arguments} (arguments
    left as the raw string — a malformed payload must stay visible), and each
    ``tool`` row gains the resolved tool ``name`` (looked up from the matching
    call id) alongside its ``tool_call_id`` and raw ``content``.
    Fields are only normalized, never reordered or dropped, so structural
    anomalies (a dangling tool_calls group with no matching tool reply, or a tool
    row whose name resolves to null) stay visible for diagnosis.
    """
    out: list[dict] = []
    current_group: dict[str, str] = {}

    for m in messages:
        role = m.get("role")
        calls = m.get("tool_calls")

        # Баг 1 fix: сбрасываем group при каждом assistant-сообщении,
        # а не только когда есть tool_calls
        if role == "assistant":
            current_group = {}
            if calls:
                for tc in calls:
                    tcid = tc.get("id")
                    name = (tc.get("function") or {}).get("name")
                    if tcid is not None and name is not None:
                        current_group[tcid] = name
                    else:
                        # Баг 2 fix: логируем аномальный tool_call
                        logger.warning(
                            "tool_call missing id or name, skipping: %s", tc
                        )

        out.append(_normalize_message(m, current_group))

    return out


def build_transcript(guest_id: str, peeked: dict) -> dict:
    """Full transcript detail for one conversation.

    ``peeked`` is store.peek(guest_id) (already None-checked by the caller). The
    transcript is normalized into a uniform message shape (see
    normalize_transcript) that still exposes the assistant tool_calls and
    role:tool results GET /history hides; ``summary`` is derived from the raw
    messages for context.
    """
    messages = peeked["messages"]
    return {
        "guest_id": guest_id,
        "last_accessed": peeked["last_accessed"],
        "summary": summarize_conversation(messages),
        "transcript": normalize_transcript(messages),
    }
