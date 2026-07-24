# Event Bus Best Practices

## Rules
- Publish canonical models only.
- Keep handlers small and idempotent.
- Use correlation IDs for cross-service tracing.
- Store and replay events from the canonical event store.
- Route failures to the dead-letter queue.
- Avoid direct module-to-module coupling for business workflows.

## Extension Guidance
- Add subscribers instead of hard-coding orchestration.
- Use plugin loading for future integrations.
- Keep event envelopes versioned and backward compatible.