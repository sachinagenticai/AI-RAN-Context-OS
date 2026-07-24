# Canonical Model Versioning

## Version Model
Canonical models carry an explicit `version` field. The platform currently emits `1.0.0` and supports no-op migration into the latest version.

## Compatibility
- backward compatibility checks are centralized in the versioning service
- migration helpers normalize payloads into the current version
- downstream engines consume stable canonical shapes rather than vendor-specific objects