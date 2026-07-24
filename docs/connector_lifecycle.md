# Connector Lifecycle

## States
- `registered`
- `initialized`
- `running`
- `stopped`
- `error`

## Lifecycle Operations
- Register
- Initialize
- Start
- Stop
- Restart
- Reconnect
- Heartbeat
- Health Check

## Operational Behavior
The manager owns lifecycle orchestration. Each connector remains focused on transport behavior and data handling while the lifecycle service standardizes state transitions and runtime supervision.

## Health and Metrics
Every connector exposes:
- status
- availability
- latency
- error count
- last sync
- heartbeat
- connection counters
- message counters
- retry counters