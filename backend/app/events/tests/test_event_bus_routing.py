from __future__ import annotations

import asyncio

from app.events.models.event import Event
from app.events.routing.matcher import EventMatcher
from app.events.routing.router import EventRouter


def test_event_router_matches_topics() -> None:
    async def scenario() -> None:
        matcher = EventMatcher()
        router = EventRouter(matcher)
        assert await matcher.matches("*", "ContextCreated")
        assert await matcher.matches("Context.*", "ContextCreated")
        assert await matcher.matches("ContextCreated", "ContextCreated")

        class Handler:
            async def handle(self, event) -> None:
                return None

        event = Event(
            event_type="ContextCreated",
            payload={"entity_type": "canonical_context", "id": "ctx-1"},
        )
        await router.register("ContextCreated", Handler())
        handlers = await router.resolve(event)
        assert handlers

    asyncio.run(scenario())