from __future__ import annotations

import asyncio

from app.events.broker.event_bus import EnterpriseEventBus


class RecordingSubscriber:
    def __init__(self) -> None:
        self.events = []

    async def handle(self, event) -> None:
        self.events.append(event)


def test_event_bus_publishes_routes_and_replays_canonical_events() -> None:
    async def scenario() -> None:
        bus = EnterpriseEventBus()
        await bus.initialize()
        await bus.start()
        await bus.register_topic("ContextCreated")

        subscriber = RecordingSubscriber()
        subscription_id = await bus.subscribe("ContextCreated", subscriber, subscriber_name="context-subscriber")

        event = await bus.publish_payload(
            {
                "source_system": "synthetic",
                "event_type": "ContextCreated",
                "payload": {"entity_type": "canonical_context", "id": "ctx-1"},
                "metadata": {"origin": "unit-test"},
                "status": "active",
            }
        )

        history = await bus.history("ContextCreated")
        replay = await bus.replay("ContextCreated", 10)
        metrics = await bus.metrics()
        health = await bus.health()
        status = await bus.status()

        assert subscription_id
        assert event.event_type == "ContextCreated"
        assert subscriber.events
        assert history
        assert replay
        assert metrics["published"] == 1
        assert health["status"] == "running"
        assert status["state"] == "running"

    asyncio.run(scenario())


def test_event_bus_dead_letter_and_unsubscribe_flow() -> None:
    async def scenario() -> None:
        bus = EnterpriseEventBus()
        await bus.initialize()
        await bus.start()
        await bus.register_topic("AlarmCreated")

        class FailingSubscriber:
            name = "failing"

            async def handle(self, event) -> None:
                raise RuntimeError("boom")

        subscription_id = await bus.subscribe("AlarmCreated", FailingSubscriber(), subscriber_name="failing")
        await bus.publish_payload(
            {
                "source_system": "synthetic",
                "event_type": "AlarmCreated",
                "payload": {"entity_type": "canonical_alarm", "id": "al-1"},
                "metadata": {},
                "status": "active",
            }
        )
        await bus.unsubscribe(subscription_id)

        dead_letters = await bus.dead_letters()

        assert dead_letters
        assert dead_letters[0]["topic"] == "AlarmCreated"

    asyncio.run(scenario())