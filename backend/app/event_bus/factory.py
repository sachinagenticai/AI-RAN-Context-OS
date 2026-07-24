from __future__ import annotations

from app.event_bus.health import EventBusHealthMonitor
from app.event_bus.lifecycle import EventBusLifecycle
from app.event_bus.manager import EventBusManager
from app.event_bus.metrics import EventBusMetricsCollector
from app.event_bus.plugins.loader import EventBusPluginLoader
from app.event_bus.registry import EventBusRegistry
from app.event_bus.validators import CanonicalEventValidator
from app.models.factories.canonical_factory import CanonicalModelFactory
from app.models.serializers.service import CanonicalSerializationService
from app.models.validation.service import CanonicalValidationService
from app.models.versioning.service import CanonicalVersioningService


def build_event_bus(plugin_paths: list[str] | None = None) -> EventBusManager:
    registry = EventBusRegistry()
    metrics = EventBusMetricsCollector()
    lifecycle = EventBusLifecycle()
    health = EventBusHealthMonitor(registry=registry, metrics=metrics, lifecycle=lifecycle)
    plugin_loader = EventBusPluginLoader()
    return EventBusManager(
        registry=registry,
        metrics=metrics,
        lifecycle=lifecycle,
        health_monitor=health,
        plugin_loader=plugin_loader,
        canonical_factory=CanonicalModelFactory(),
        canonical_validator=CanonicalValidationService(),
        canonical_serializer=CanonicalSerializationService(),
        canonical_versioning=CanonicalVersioningService(),
        event_validator=CanonicalEventValidator(),
        plugin_paths=plugin_paths or [],
    )