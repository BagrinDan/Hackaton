from dataclasses import dataclass, field

@dataclass
class Metrics:
    total_conversations: int = 0
    max_conversations: int = 0
    total_messages: int = 0
    total_user_turns: int = 0
    total_assistant_turns: int = 0
    tool_calls_total: int = 0
    tool_calls_by_name: dict[str, int] = field(default_factory=dict)
    tool_errors_total: int = 0
    fallback_total: int = 0
    censored_messages_total: int = 0
    conversations_with_fallback: int = 0
    conversations_with_tool_error: int = 0
    conversations_with_censored: int = 0