# Runtime Execution Flow

## Startup
1. The event bus manager initializes lifecycle state.
2. Plugin modules are loaded through the async plugin loader.
3. Topics and subscriptions are registered in the in-memory registry.
4. Health and metrics services begin reporting runtime state.

## Publish Path
1. A producer submits an event payload.
2. The event is converted into a canonical enterprise object.
3. The canonical event is validated.
4. The registry stores the event under its topic.
5. Subscribers for the topic are invoked asynchronously.
6. Metrics are updated for publish, delivery, and failure counts.

## Replay Path
1. A replay request targets a topic and limit.
2. The registry returns the stored canonical events.
3. The bus emits a replay response without mutating downstream modules.

## Shutdown
1. The lifecycle manager transitions the bus to stopped.
2. The health snapshot reflects the stopped state.
3. The registry remains read-only for inspection until restart.