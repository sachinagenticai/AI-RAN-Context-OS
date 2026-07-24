# Extension Guide

## Adding New Event Capabilities
To extend the event bus without changing downstream modules:

1. Create a plugin module.
2. Expose an async `register_plugins(bus)` function.
3. Register topics, subscriptions, or custom subscribers.
4. Keep all payloads canonical.

## Adding New Event Types
New event categories should be represented through canonical event models and topic naming, not through vendor-specific handling inside the bus.

## Safe Extension Rules
- Do not bypass canonical validation.
- Do not introduce vendor payloads into the bus core.
- Prefer new subscribers or topic registrations over modifying the manager.
- Keep extensions async and side-effect bounded.