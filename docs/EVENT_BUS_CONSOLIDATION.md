# Event Bus Consolidation

## Decision

The official Enterprise Event Bus is now `backend/app/events/`.

The legacy `backend/app/event_bus/` package is obsolete and has been reduced to a compatibility shim that re-exports the official implementation. The product code, API router, tests, and new event envelope all live in `app.events`.

## Why `app/events` is official

`app/events` is the implementation already wired into the shared backend router and the application entrypoint. It contains the async broker, routing, registry, persistence, replay, dead-letter handling, health, metrics, and API surface that the enterprise event bus requires.

It also uses the new `Event` envelope that is independent from the canonical enterprise data model. That separation was necessary because the canonical model layer is intentionally strict about canonical entity types and should not be forced to accept event bus-specific vocabulary.

## What was obsolete in `app/event_bus`

The legacy package duplicated the same concerns with a second manager, second API router, second test suite, and its own plugin/registry/metrics stack. It also depended on the canonical event model path, which conflicted with the new event envelope contract.

That package is now obsolete because it duplicated behavior already implemented in `app/events`.

## Changes made

### Official implementation

- Added missing topic listing and topic summary methods to `backend/app/events/broker/event_bus.py`.
- Kept the async publish, subscribe, replay, health, metrics, history, dead-letter, and status operations in the official bus.
- Preserved backward-compatible payload ingestion by accepting the same loose request shape used by the prior API.

### API surface

- Kept the live `/events` router in `backend/app/events/api/router.py`.
- Added `/events/topics` and `/events/topics/{topic}` so the official package covers the legacy topic endpoints.
- Preserved the existing publish, subscribe, replay, history, dead-letter, status, health, and metrics endpoints.

### Compatibility shim

- Repointed `backend/app/event_bus/__init__.py` to the official bus and router.
- Repointed `backend/app/event_bus/api/__init__.py` to the official router.
- Replaced `backend/app/event_bus/api/router.py` with a thin re-export of `app.events.api.router`.
- Kept the legacy import path usable for any callers that still import `app.event_bus`.

### Tests

- Removed the duplicate legacy event bus tests under `backend/app/event_bus/tests/`.
- Kept the official test suite under `backend/app/events/tests/`.
- Added package markers where needed so pytest does not collide on duplicate test basenames.

## Backward compatibility

Backward compatibility is preserved at the import level:

- `import app.event_bus` still resolves, but it now forwards to the official implementation.
- `app.event_bus.api.router` still exists as an alias to the official router.

Behaviorally, the bus keeps the same endpoints and request shapes, but the authoritative implementation now lives in one place.

## Verification

- `pytest app/events/tests -q` passed.
- `pytest -q` passed with 79 tests.

## Result

There is now one source of truth for the Enterprise Event Bus: `backend/app/events/`.