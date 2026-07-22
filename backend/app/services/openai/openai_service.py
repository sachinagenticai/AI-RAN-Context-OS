from __future__ import annotations

from typing import Any

from app.integrations.openai.client import OpenAIClientProtocol
from app.integrations.openai.prompt_manager import PromptManager
from app.integrations.openai.response_parser import ResponseParser
from app.integrations.openai.tool_registry import ToolRegistry


class OpenAIService:
    """Application service that isolates business logic from OpenAI integration details."""

    def __init__(
        self,
        *,
        client: OpenAIClientProtocol,
        prompt_manager: PromptManager,
        tool_registry: ToolRegistry,
        response_parser: ResponseParser,
        model: str = "gpt-4o-mini",
    ) -> None:
        self._client = client
        self._prompt_manager = prompt_manager
        self._tool_registry = tool_registry
        self._response_parser = response_parser
        self._model = model

    def execute(self, *, prompt_name: str, context: str | None = None) -> dict[str, Any]:
        prompt_text = self._prompt_manager.get_prompt(prompt_name, context=context)
        tools = self._tool_registry.get_tools()
        response = self._client.create_response(model=self._model, input_text=prompt_text, tools=tools)
        return self._response_parser.parse(response)
