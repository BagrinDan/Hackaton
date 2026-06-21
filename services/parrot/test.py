
import os
import httpx

BASE_URL = os.getenv("BASE_URL", "http://localhost:3003").rstrip("/")
SECRET = os.getenv("INTERNAL_SECRET", "")

HEADERS = {"X-Internal-Secret": SECRET} if SECRET else {}
GUEST_ID = "test-guest-001"
TIMEOUT = httpx.Timeout(60.0)  

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def get(path: str, **kwargs) -> httpx.Response:
    return httpx.get(f"{BASE_URL}{path}", headers=HEADERS, timeout=TIMEOUT, **kwargs)

def post(path: str, **kwargs) -> httpx.Response:
    return httpx.post(f"{BASE_URL}{path}", headers=HEADERS, timeout=TIMEOUT, **kwargs)

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class TestHealth:
    def test_health_returns_ok(self):
        r = get("/health")
        assert r.status_code == 200
        assert r.json() == {"status": "ok"}


# ---------------------------------------------------------------------------
# POST /chat
# ---------------------------------------------------------------------------

class TestChat:
    def test_basic_reply(self):
        r = post("/chat", json={"message": "Hello", "guest_id": GUEST_ID})
        assert r.status_code == 200
        body = r.json()
        assert "reply" in body
        assert isinstance(body["reply"], str)
        assert len(body["reply"]) > 0

    def test_reply_without_guest_id(self):
        """Chat without guest_id should still work (stateless)."""
        r = post("/chat", json={"message": "Hi"})
        assert r.status_code == 200
        assert "reply" in r.json()

    def test_empty_message(self):
        """Empty message — service should handle gracefully (not 500)."""
        r = post("/chat", json={"message": "", "guest_id": GUEST_ID})
        assert r.status_code in (200, 400, 422)

    def test_missing_message_field(self):
        """Missing required field — FastAPI should return 422."""
        r = post("/chat", json={"guest_id": GUEST_ID})
        assert r.status_code == 422

    def test_very_long_message(self):
        """Long message should not crash the service."""
        long_msg = "Tell me about hotels. " * 50
        r = post("/chat", json={"message": long_msg, "guest_id": GUEST_ID})
        assert r.status_code in (200, 502)


# ---------------------------------------------------------------------------
# POST /chat/stream
# ---------------------------------------------------------------------------

class TestChatStream:
    def test_stream_returns_event_stream(self):
        with httpx.stream(
            "POST",
            f"{BASE_URL}/chat/stream",
            json={"message": "Hello", "guest_id": GUEST_ID},
            headers=HEADERS,
            timeout=60,
        ) as r:
            assert r.status_code == 200
            assert "text/event-stream" in r.headers.get("content-type", "")
            chunks = []
            for line in r.iter_lines():
                chunks.append(line)
                if len(chunks) >= 5:
                    break
            assert len(chunks) > 0

    def test_stream_no_cache_headers(self):
        with httpx.stream(
            "POST",
            f"{BASE_URL}/chat/stream",
            json={"message": "Hi", "guest_id": GUEST_ID},
            headers=HEADERS,
            timeout=30,
        ) as r:
            assert r.headers.get("cache-control") == "no-cache"
            assert r.headers.get("x-accel-buffering") == "no"


# ---------------------------------------------------------------------------
# GET /history/{guest_id}
# ---------------------------------------------------------------------------

class TestHistory:
    def setup_method(self):
        """Send a message first so history is not empty."""
        post("/chat", json={"message": "Remember me", "guest_id": GUEST_ID})

    def test_history_returns_messages(self):
        r = get(f"/history/{GUEST_ID}")
        assert r.status_code == 200
        body = r.json()
        assert "guest_id" in body
        assert "messages" in body
        assert isinstance(body["messages"], list)

    def test_history_unknown_guest(self):
        """Unknown guest_id should return empty messages, not 404."""
        r = get("/history/nonexistent-guest-xyz")
        assert r.status_code == 200
        assert r.json()["messages"] == []

    def test_history_message_shape(self):
        r = get(f"/history/{GUEST_ID}")
        messages = r.json()["messages"]
        if messages:
            msg = messages[0]
            assert "role" in msg
            assert "content" in msg
            assert msg["role"] in ("user", "assistant")


# ---------------------------------------------------------------------------
# GET /admin/metrics
# ---------------------------------------------------------------------------

class TestAdminMetrics:
    def test_metrics_shape(self):
        r = get("/admin/metrics")
        assert r.status_code == 200
        body = r.json()
        expected_keys = [
            "total_conversations",
            "max_conversations",
            "total_messages",
            "total_user_turns",
            "total_assistant_turns",
            "tool_calls_total",
            "tool_calls_by_name",
            "tool_errors_total",
            "fallback_total",
            "censored_messages_total",
            "conversations_with_fallback",
            "conversations_with_tool_error",
            "conversations_with_censored",
        ]
        for key in expected_keys:
            assert key in body, f"Missing key: {key}"

    def test_metrics_types(self):
        body = get("/admin/metrics").json()
        assert isinstance(body["total_conversations"], int)
        assert isinstance(body["total_messages"], int)
        assert isinstance(body["tool_calls_by_name"], dict)

    def test_metrics_non_negative(self):
        body = get("/admin/metrics").json()
        for key, val in body.items():
            if isinstance(val, int):
                assert val >= 0, f"{key} is negative: {val}"


# ---------------------------------------------------------------------------
# GET /admin/conversations
# ---------------------------------------------------------------------------

class TestAdminConversations:
    def setup_method(self):
        post("/chat", json={"message": "Hello", "guest_id": GUEST_ID})

    def test_conversations_list(self):
        r = get("/admin/conversations")
        assert r.status_code == 200
        body = r.json()
        assert "count" in body
        assert "conversations" in body
        assert isinstance(body["conversations"], list)
        assert body["count"] == len(body["conversations"])

    def test_conversations_sorted_newest_first(self):
        r = get("/admin/conversations")
        convs = r.json()["conversations"]
        if len(convs) >= 2:
            times = [c["last_accessed"] for c in convs]
            assert times == sorted(times, reverse=True)

    def test_conversation_row_shape(self):
        r = get("/admin/conversations")
        convs = r.json()["conversations"]
        if convs:
            row = convs[0]
            assert "guest_id" in row
            assert "last_accessed" in row
            assert "turns" in row


# ---------------------------------------------------------------------------
# GET /admin/conversations/{guest_id}
# ---------------------------------------------------------------------------

class TestAdminConversationDetail:
    def setup_method(self):
        post("/chat", json={"message": "Detail test", "guest_id": GUEST_ID})

    def test_detail_found(self):
        r = get(f"/admin/conversations/{GUEST_ID}")
        assert r.status_code == 200
        body = r.json()
        assert body["guest_id"] == GUEST_ID
        assert "last_accessed" in body
        assert "summary" in body
        assert "transcript" in body

    def test_detail_not_found(self):
        r = get("/admin/conversations/nonexistent-guest-xyz")
        assert r.status_code == 404
        assert r.json()["detail"] == "Conversation not found"

    def test_transcript_message_shape(self):
        r = get(f"/admin/conversations/{GUEST_ID}")
        transcript = r.json()["transcript"]
        assert isinstance(transcript, list)
        if transcript:
            msg = transcript[0]
            assert "role" in msg
            assert "content" in msg