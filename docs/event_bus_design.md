# Event Bus Design

## Design Goals
- async throughout
- provider agnostic
- canonical-first payloads
- in-memory runtime today
- adapter-friendly for future brokers

## Event Envelope
Each event includes:
- event id
- correlation id
- trace id
- tenant id
- source
- target
- event type
- timestamp
- priority
- version
- payload
- metadata
- headers
- tags
- retry count

## Supported Patterns
- publish / subscribe
- fan-out
- point-to-point
- broadcast
- request / reply
- event replay
- scheduled events