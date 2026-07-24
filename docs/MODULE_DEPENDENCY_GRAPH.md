# Module Dependency Graph

## Platform Dependency Summary
The platform is organized so that data moves through the following dependency chain:

```mermaid
flowchart TD
    A[Connectors] --> B[Canonical Enterprise Data Model]
    B --> C[Event Bus]
    C --> D[Context Intelligence]
    D --> E[Reasoning Engine]
    E --> F[Policy Engine]
    F --> G[Enterprise Memory]
    G --> H[AI Kernel]
```

## Notes
- Connectors are the only ingress point for vendor payloads.
- Canonical models are the only objects allowed past connector transformation.
- The event bus provides the runtime backbone for asynchronous enterprise workflows.
- Downstream intelligence modules consume canonical entities only.