import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def load_context(context_dir: str) -> str:
    path = Path(context_dir)
    if not path.is_dir():
        logger.warning("Context directory %s not found, running without context", context_dir)
        return ""

    sections = []
    for f in sorted(path.glob("*.md")) + sorted(path.glob("*.txt")):
        text = f.read_text(encoding="utf-8").strip()
        if text:
            sections.append(f"--- {f.name} ---\n{text}")

    if not sections:
        logger.warning("No context documents found in %s", context_dir)
        return ""

    return "\n\n".join(sections)
