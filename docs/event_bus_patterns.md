# Event Bus Patterns

## Publish / Subscribe
Use for normal platform signaling between kernel, context, reasoning, policy, and memory subscribers.

## Fan-Out
One event can drive multiple subscribers when multiple services need to react independently.

## Point-to-Point
Use explicit topic routing when exactly one handler should process the event.

## Broadcast
Use broad topics for platform-wide notifications and audit-style distribution.

## Request / Reply
Use event correlation and trace IDs to pair request and response events.

## Replay
Use the event store and replay service to re-drive historical events without reintroducing vendor payloads.