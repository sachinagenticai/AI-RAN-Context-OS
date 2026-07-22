from __future__ import annotations

from typing import Final

DEFAULT_NAMESPACE: Final[str] = "default"
DEFAULT_OUTPUT_FORMAT: Final[str] = "json"
DEFAULT_BATCH_SIZE: Final[int] = 100
SUPPORTED_OUTPUT_FORMATS: Final[tuple[str, ...]] = ("json", "jsonl", "csv")
