from __future__ import annotations

from app.event_bus.exceptions import EventBusValidationError
from app.models.canonical.events.models import CanonicalEvent


class CanonicalEventValidator:
    async def validate(self, event: CanonicalEvent) -> None:
        if not event.id:
            raise EventBusValidationError("Event id is required")
        if not event.source_system:
            raise EventBusValidationError("Event source_system is required")
        if not event.vendor:
            raise EventBusValidationError("Event vendor is required")
        if not event.version:
            raise EventBusValidationError("Event version is required")