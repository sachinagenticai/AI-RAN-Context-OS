# Canonical Model Best Practices

## Guidance
- Keep vendor-specific logic in mappers only.
- Keep canonical entities strongly typed and versioned.
- Preserve raw vendor payloads in metadata for traceability, not for downstream processing.
- Validate before persistence or orchestration.
- Prefer adding new mapper registrations over modifying downstream engines.