from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class EventBusConfig:
    name: str = "enterprise-event-bus"
    version: str = "1.0.0"
    plugin_paths: list[str] = field(default_factory=list)
    default_topic: str = "events"
