from __future__ import annotations

from typing import Any

from app.connectors.exceptions.connector_exceptions import ConnectorConfigurationError


class DefaultValidator:
    async def validate(self, payload: Any) -> None:
        if payload is None:
            raise ConnectorConfigurationError("Payload cannot be null")
        if isinstance(payload, dict) and not payload:
            raise ConnectorConfigurationError("Payload cannot be empty")