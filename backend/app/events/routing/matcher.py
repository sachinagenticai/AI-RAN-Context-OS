from __future__ import annotations


class EventMatcher:
    async def matches(self, registered_topic: str, event_type: str) -> bool:
        event_name = str(event_type)
        return registered_topic == event_name or registered_topic == "*" or registered_topic.endswith(".*") and event_name.startswith(registered_topic[:-2])
