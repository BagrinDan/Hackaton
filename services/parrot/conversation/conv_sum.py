from dataclasses import dataclass, field

@dataclass
class ConversationSummary:
    turns: int = 0
    censored_count: int = 0
    total_messages: int = 0
    assistant_turns: int = 0
    tool_calls_by_name: dict[str, int] = field(default_factory=dict)
    tool_calls_total: int = 0
    tool_errors: int = 0
    fallback_count: int = 0

    @property
    def has_censored(self) -> bool:
        return self.censored_count > 0

    @property
    def has_fallback(self) -> bool:
        return self.fallback_count > 0

    @property
    def has_tool_error(self) -> bool:
        return self.tool_errors > 0