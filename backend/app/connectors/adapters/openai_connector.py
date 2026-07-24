from __future__ import annotations

from typing import Any

from app.connectors.base.connectors import BaseCloudConnector
from app.connectors.utils.helpers import utc_now
from app.integrations.openai.client import OpenAIClient
from app.integrations.openai.prompt_manager import PromptManager, PromptTemplate
from app.integrations.openai.response_parser import ResponseParser
from app.integrations.openai.tool_registry import ToolRegistry
from app.services.openai.openai_service import OpenAIService


def build_openai_service() -> OpenAIService:
    prompt_manager = PromptManager([PromptTemplate("connector_summary", "Connector summary: {context}")])
    tool_registry = ToolRegistry()
    tool_registry.register("connector_lookup", lambda: None)
    return OpenAIService(
        client=OpenAIClient(),
        prompt_manager=prompt_manager,
        tool_registry=tool_registry,
        response_parser=ResponseParser(),
    )


class OpenAIConnectorWrapper(BaseCloudConnector):
    def __init__(self, *, openai_service: OpenAIService, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._openai_service = openai_service

    async def request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        body = payload or {}
        result = self._openai_service.execute(prompt_name="connector_summary", context=str(body.get("context", "")))
        await self._record_records(records=1, messages=1)
        return {"method": method, "path": path, "timestamp": utc_now(), "response": result}

    async def invoke(self, payload: dict[str, Any]) -> dict[str, Any]:
        prepared = await self._prepare_payload(payload, profile="Synthetic")
        result = self._openai_service.execute(prompt_name="connector_summary", context=str(prepared))
        await self._record_records(records=1, messages=1)
        return {"connector_id": self.connector_id, "prepared": prepared, "result": result}