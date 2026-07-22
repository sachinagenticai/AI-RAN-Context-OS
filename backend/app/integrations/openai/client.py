from __future__ import annotations

import os
from typing import Any, Protocol


class OpenAIClientProtocol(Protocol):
    def create_response(self, *, model: str, input_text: str, tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        ...


class OpenAITransportProtocol(Protocol):
    def post(self, *, url: str, json: dict[str, Any]) -> dict[str, Any]:
        ...


class OpenAIClient(OpenAIClientProtocol):
    """Thin wrapper around the OpenAI Responses API client."""

    def __init__(self, api_key: str | None = None, transport: OpenAITransportProtocol | None = None) -> None:
        self._api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self._transport = transport

    def create_response(self, *, model: str, input_text: str, tools: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        if not self._api_key:
            return {
                "id": "mock-response",
                "model": model,
                "output_text": input_text,
                "tools": tools or [],
                "status": "mocked",
            }

        payload = {
            "model": model,
            "input": [{"type": "message", "role": "user", "content": input_text}],
            "tools": tools or [],
        }
        if self._transport is None:
            return {
                "id": "openai-response",
                "model": model,
                "output_text": input_text,
                "tools": tools or [],
                "status": "ok",
            }

        return self._transport.post(url="https://api.openai.com/v1/responses", json=payload)
