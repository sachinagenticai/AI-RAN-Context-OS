from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from app.events.broker.event_bus import EnterpriseEventBus, event_bus
from app.events.models.event import Event
from app.models.factories.canonical_factory import CanonicalModelFactory


router = APIRouter(prefix="/events", tags=["events"])


def get_event_bus() -> EnterpriseEventBus:
    return event_bus


@router.get("", response_model=dict)
async def describe(bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return await bus.status()


@router.get("/topics", response_model=list[str])
async def list_topics(bus: EnterpriseEventBus = Depends(get_event_bus)) -> list[str]:
    return await bus.list_topics()


@router.get("/topics/{topic}", response_model=dict)
async def topic_summary(topic: str, bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return await bus.topic_summary(topic)


@router.post("/publish", response_model=dict)
async def publish_event(request: dict, bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    try:
        event = await bus.publish_payload(request)
        return {"accepted": True, "event": event.model_dump(mode="json")}
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/subscribe", response_model=dict)
async def subscribe_event(request: dict, bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    topic = str(request.get("topic", ""))
    subscriber_name = str(request.get("subscriber_name", "subscriber"))

    class _Subscriber:
        name = subscriber_name

        async def handle(self, event: Event) -> None:
            return None

    subscription_id = await bus.subscribe(topic, _Subscriber(), subscriber_name=subscriber_name, metadata=request.get("metadata", {}))
    return {"subscription_id": subscription_id, "topic": topic, "subscriber_name": subscriber_name, "active": True}


@router.delete("/subscriptions/{subscription_id}", response_model=dict)
async def unsubscribe_event(subscription_id: str, bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, str]:
    await bus.unsubscribe(subscription_id)
    return {"subscription_id": subscription_id, "status": "removed"}


@router.post("/replay", response_model=dict)
async def replay_events(request: dict, bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    topic = str(request.get("topic", ""))
    limit = int(request.get("limit", 100))
    events = await bus.replay(topic, limit)
    return {"topic": topic, "replayed": len(events), "events": events}


@router.get("/history", response_model=dict)
async def history(topic: str | None = Query(default=None), bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return {"topic": topic, "events": await bus.history(topic)}


@router.get("/deadletter", response_model=dict)
async def deadletter(bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return {"events": await bus.dead_letters()}


@router.get("/status", response_model=dict)
async def status(bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return await bus.status()


@router.get("/health", response_model=dict)
async def health(bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return await bus.health()


@router.get("/metrics", response_model=dict)
async def metrics(bus: EnterpriseEventBus = Depends(get_event_bus)) -> dict[str, object]:
    return await bus.metrics()