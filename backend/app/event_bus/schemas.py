from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


class EventBusState(str):
    CREATED = "created"
    INITIALIZED = "initialized"
    RUNNING = "running"
    STOPPED = "stopped"
    DEGRADED = "degraded"


class EventPublishRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str = Field(min_length=1)
    event: dict[str, Any] = Field(default_factory=dict)


class EventSubscribeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str = Field(min_length=1)
    subscriber_name: str = Field(min_length=1)
    metadata: dict[str, Any] = Field(default_factory=dict)


class EventReplayRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str = Field(min_length=1)
    limit: int = Field(default=100, ge=1, le=1000)


class EventBusStatusResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    state: str
    topics: int
    subscriptions: int
    events: int
    last_event_at: str | None = None
    plugin_count: int = 0


class EventBusMetricsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    published: int = 0
    delivered: int = 0
    failed: int = 0
    subscriptions: int = 0
    topic_events: dict[str, int] = Field(default_factory=dict)
    delivery_latency_ms: float = 0.0


class EventTopicResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    event_count: int
    subscription_count: int
    last_event_at: str | None = None


class EventPublicationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accepted: bool
    topic: str
    event_id: str
    delivered_to: list[str] = Field(default_factory=list)
    timestamp: str = Field(default_factory=_utc_now)


class EventSubscriptionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    subscription_id: str
    topic: str
    subscriber_name: str
    active: bool = True


class EventReplayResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    topic: str
    replayed: int
    events: list[dict[str, Any]] = Field(default_factory=list)