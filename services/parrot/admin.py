"""Admin metrics helpers for the parrot service."""
import json

from llm import FALLBACK
from profanity import contains_mask

_ERROR_KEY = "error"


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


def summarize_conversation(messages: list[dict]) -> dict:
    """Per-conversation summary derived purely from a raw message list.

    An assistant message carrying tool_calls is counted as a tool-call message
    (matching get_visible's rule), never as a final assistant turn, and its
    content is not checked for FALLBACK — FALLBACK is only ever emitted on a
    content-only assistant message.
    """
    turns = 0
    censored_count = 0
    assistant_turns = 0
    tool_calls_by_name: dict[str, int] = {}
    tool_calls_total = 0
    tool_errors = 0
    fallback_count = 0

    for m in messages:
        role = m.get("role")
        if role == "user":
            turns += 1
            if contains_mask(m.get("content")):
                censored_count += 1
        elif role == "assistant":
            calls = m.get("tool_calls")
            if calls:
                for tc in calls:
                    name = (tc.get("function") or {}).get("name") or "unknown"
                    tool_calls_by_name[name] = tool_calls_by_name.get(name, 0) + 1
                    tool_calls_total += 1
            else:
                assistant_turns += 1
                if m.get("content") == FALLBACK:
                    fallback_count += 1
        elif role == "tool":
            if _tool_result_is_error(m.get("content")):
                tool_errors += 1

    return {
        "turns": turns,
        "censored_count": censored_count,
        "total_messages": len(messages),
        "assistant_turns": assistant_turns,
        "tool_calls_by_name": tool_calls_by_name,
        "tool_calls_total": tool_calls_total,
        "tool_errors": tool_errors,
        "fallback_count": fallback_count,
        "has_censored": censored_count > 0,
        "has_fallback": fallback_count > 0,
        "has_tool_error": tool_errors > 0,
    }


def build_metrics(store) -> dict:
    """Aggregate metrics across the whole current in-memory window."""
    snap = store.snapshot()
    total_messages = 0
    total_user_turns = 0
    total_assistant_turns = 0
    tool_calls_by_name: dict[str, int] = {}
    tool_calls_total = 0
    tool_errors_total = 0
    fallback_total = 0
    censored_messages_total = 0
    conversations_with_fallback = 0
    conversations_with_tool_error = 0
    conversations_with_censored = 0

    for entry in snap.values():
        s = summarize_conversation(entry["messages"])
        total_messages += s["total_messages"]
        total_user_turns += s["turns"]
        total_assistant_turns += s["assistant_turns"]
        for name, n in s["tool_calls_by_name"].items():
            tool_calls_by_name[name] = tool_calls_by_name.get(name, 0) + n
        tool_calls_total += s["tool_calls_total"]
        tool_errors_total += s["tool_errors"]
        fallback_total += s["fallback_count"]
        censored_messages_total += s["censored_count"]
        if s["has_fallback"]:
            conversations_with_fallback += 1
        if s["has_tool_error"]:
            conversations_with_tool_error += 1
        if s["has_censored"]:
            conversations_with_censored += 1

    return {
        "total_conversations": len(snap),
        "max_conversations": store.max_conversations,
        "total_messages": total_messages,
        "total_user_turns": total_user_turns,
        "total_assistant_turns": total_assistant_turns,
        "tool_calls_total": tool_calls_total,
        "tool_calls_by_name": tool_calls_by_name,
        "tool_errors_total": tool_errors_total,
        "fallback_total": fallback_total,
        "censored_messages_total": censored_messages_total,
        "conversations_with_fallback": conversations_with_fallback,
        "conversations_with_tool_error": conversations_with_tool_error,
        "conversations_with_censored": conversations_with_censored,
    }


def list_conversations(store) -> list[dict]:
    """Per-conversation rows (guest_id + last_accessed + flattened summary).

    Sorted newest-activity-first so the admin list surfaces the most recently
    active sessions — and their has_fallback / has_tool_error health flags —
    without a per-conversation detail fetch.
    """
    snap = store.snapshot()
    rows = [
        {"guest_id": guest_id, "last_accessed": entry["last_accessed"],
         **summarize_conversation(entry["messages"])}
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
    # Resolve tool names per tool-call group (against the most recent preceding
    # assistant.tool_calls turn), NOT via a conversation-wide id map: synthesized
    # streaming ids (e.g. "call_0") repeat across rounds, so a global last-wins map
    # would mislabel an earlier round's tool row with a later round's tool name.
    out: list[dict] = []
    current_group: dict[str, str] = {}
    for m in messages:
        calls = m.get("tool_calls")
        if calls:
            current_group = {}
            for tc in calls:
                tcid = tc.get("id")
                name = (tc.get("function") or {}).get("name")
                if tcid is not None and name is not None:
                    current_group[tcid] = name
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
