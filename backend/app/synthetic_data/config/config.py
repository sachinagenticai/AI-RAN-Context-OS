from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional


@dataclass(slots=True)
class SyntheticDataSettings:
    """Application configuration for the synthetic data framework.

    This class is intentionally lightweight and framework-oriented so that
    concrete generators and exporters can extend it in a type-safe way.
    """

    enabled: bool = True
    output_format: str = "json"
    log_level: str = "INFO"
    batch_size: int = 100
    max_records: Optional[int] = None
    namespace: str = "default"
    metadata: dict[str, object] = field(default_factory=dict)
