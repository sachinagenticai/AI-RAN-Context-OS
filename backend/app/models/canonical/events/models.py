from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import EventType


class EventEntity(CanonicalEntityModel):
    event_type: EventType = EventType.GENERIC


class CanonicalEventMetadata(EventEntity):
    entity_type: str = "canonical_event_metadata"


class CanonicalEventPayload(EventEntity):
    entity_type: str = "canonical_event_payload"
    payload: dict[str, object] = Field(default_factory=dict)


class CanonicalEventContext(EventEntity):
    entity_type: str = "canonical_event_context"
    context: dict[str, object] = Field(default_factory=dict)


class CanonicalEvent(EventEntity):
    entity_type: str = "canonical_event"
    payload: dict[str, object] = Field(default_factory=dict)