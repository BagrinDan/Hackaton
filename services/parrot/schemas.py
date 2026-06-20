from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    # Bound the inbound message: an unbounded body amplifies LLM token cost and
    # grows in-memory history (which is trimmed by message count, not bytes).
    message: str = Field(max_length=4000)
    guest_id: str | None = None


class ChatResponse(BaseModel):
    reply: str


class Message(BaseModel):
    role: str
    content: str | None = None


class HistoryResponse(BaseModel):
    guest_id: str
    messages: list[Message]


class ConversationSummary(BaseModel):
    guest_id: str
    last_accessed: float
    turns: int
    censored_count: int
    total_messages: int
    assistant_turns: int
    tool_calls_by_name: dict[str, int]
    tool_calls_total: int
    tool_errors: int
    fallback_count: int
    has_censored: bool
    has_fallback: bool
    has_tool_error: bool


class ConversationListResponse(BaseModel):
    count: int
    conversations: list[ConversationSummary]


class MetricsResponse(BaseModel):
    total_conversations: int
    max_conversations: int
    total_messages: int
    total_user_turns: int
    total_assistant_turns: int
    tool_calls_total: int
    tool_calls_by_name: dict[str, int]
    tool_errors_total: int
    fallback_total: int
    censored_messages_total: int
    conversations_with_fallback: int
    conversations_with_tool_error: int
    conversations_with_censored: int


class ConversationDetailResponse(BaseModel):
    guest_id: str
    last_accessed: float
    summary: dict
    transcript: list[dict]  # raw OpenAI messages, incl. tool_calls + tool results
