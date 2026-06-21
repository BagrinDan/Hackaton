import time


class ConversationStore:
    def __init__(self, max_messages: int = 20, ttl_seconds: int = 1800, max_conversations: int = 500):
        self._max_messages = max_messages
        self._ttl = ttl_seconds
        self._max_conversations = max_conversations
        self._conversations: dict[str, dict] = {}

    def get_messages(self, guest_id: str) -> list[dict]:
        entry = self._conversations.get(guest_id)
        if entry is None:
            return []
        entry["last_accessed"] = time.time()
        return list(entry["messages"])

    def append(self, guest_id: str, messages: list[dict]) -> None:
        if guest_id not in self._conversations:
            self._conversations[guest_id] = {
                "messages": [],
                "last_accessed": time.time(),
            }
        entry = self._conversations[guest_id]
        entry["messages"].extend(messages)
        entry["last_accessed"] = time.time()
        self._trim(entry)

    def get_visible(self, guest_id: str) -> list[dict]:
        entry = self._conversations.get(guest_id)
        if entry is None:
            return []
        return [
            m for m in entry["messages"]
            if m.get("role") in ("user", "assistant") and "tool_calls" not in m
        ]

    def _trim(self, entry: dict) -> None:
        msgs = entry["messages"]
        content_count = sum(1 for m in msgs if m.get("role") in ("user", "assistant") and "tool_calls" not in m)
        while content_count > self._max_messages and msgs:
            if msgs[0].get("role") == "user":
                msgs.pop(0)
                content_count -= 1
            while msgs and msgs[0].get("role") != "user":
                if msgs[0].get("role") == "assistant" and "tool_calls" not in msgs[0]:
                    content_count -= 1
                msgs.pop(0)

    def cleanup(self) -> None:
        now = time.time()
        expired = [gid for gid, e in self._conversations.items() if now - e["last_accessed"] > self._ttl]
        for gid in expired:
            del self._conversations[gid]
        if len(self._conversations) > self._max_conversations:
            by_age = sorted(self._conversations, key=lambda g: self._conversations[g]["last_accessed"])
            for gid in by_age[: len(self._conversations) - self._max_conversations]:
                del self._conversations[gid]

    # --- Admin / observability reads (non-mutating: do NOT bump last_accessed) ---

    def peek(self, guest_id: str) -> dict | None:
        """Non-mutating single-conversation read for admin inspection.

        Returns {"messages": <copy>, "last_accessed": <float>} or None if unknown.
        Unlike get_messages, this does NOT refresh last_accessed — inspecting a
        conversation must not keep it alive or skew TTL eviction.
        """
        entry = self._conversations.get(guest_id)
        if entry is None:
            return None
        return {"messages": list(entry["messages"]), "last_accessed": entry["last_accessed"]}

    def snapshot(self) -> dict[str, dict]:
        """Non-mutating snapshot of every conversation, keyed by guest_id.

        Each value is {"messages": <copy>, "last_accessed": <float>}; message
        lists are copied (one level) so callers can't mutate stored state, and
        last_accessed is never bumped.
        """
        return {
            gid: {"messages": list(e["messages"]), "last_accessed": e["last_accessed"]}
            for gid, e in self._conversations.items()
        }

    @property
    def max_conversations(self) -> int:
        """Configured capacity ceiling (exposed read-only for admin metrics)."""
        return self._max_conversations
