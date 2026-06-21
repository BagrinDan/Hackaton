import re

from services.parrot.core.config import settings

# Character used to mask a profane word, preserving its length. Single source of
# truth so store-derived metrics (admin.py) can detect a masked message.
MASK_CHAR = "*"

# Stop list sourced from PROFANITY_WORDS (config.py), comma-separated, falling back
# to the curated default when unset.
PROFANITY_WORDS = [w.strip() for w in settings.profanity_words.split(",") if w.strip()]

# Match the stop list as a raw substring alternation, longest-first so multi-letter
# words win over their prefixes. Case-insensitive so "ASS" masks the same as "ass".
_PATTERN = re.compile(
    "|".join(re.escape(w) for w in sorted(PROFANITY_WORDS, key=len, reverse=True)),
    re.IGNORECASE,
)


def mask_profanity(text: str) -> str:
    """Mask profane words in user-supplied text, preserving length with '*'."""
    if not text:
        return text
    return _PATTERN.sub(lambda m: MASK_CHAR * len(m.group(0)), text)


def contains_mask(text) -> bool:
    """True if text carries a profanity mask produced by mask_profanity."""
    return bool(text) and MASK_CHAR in text
