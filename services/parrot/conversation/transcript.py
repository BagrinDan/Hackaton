from dataclasses import dataclass
from conv_sum import ConversationSummary


@dataclass
class TranscriptDetail:
    guest_id: str
    last_accessed: float
    summary: ConversationSummary
    transcript: list[dict]