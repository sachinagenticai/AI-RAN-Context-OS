# Plugin Developer Guide

## Plugin Contract
A plugin module should expose one of the following async entrypoints:

- `register_plugins(bus)`
- `register(bus)` on a plugin object

The plugin may register:
- topics
- subscribers
- health hooks
- event handlers

## Example Shape
```python
async def register_plugins(bus):
    await bus.register_topic("custom.events")
    return ["custom.events"]
```

## Operational Expectations
- Plugins must be asynchronous.
- Plugins should emit or consume canonical events only.
- Plugins should not depend on vendor-specific payloads.
- Plugins should fail fast if the bus contract changes.

## Current Mock Plugin
The repository includes a mock plugin at `app/event_bus/plugins/mock_plugins.py` that demonstrates topic registration and subscriber loading.