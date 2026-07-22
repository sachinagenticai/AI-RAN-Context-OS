from __future__ import annotations

from app.integrations.openai.client import OpenAIClient
from app.integrations.openai.prompt_manager import PromptManager, PromptTemplate
from app.integrations.openai.response_parser import ResponseParser
from app.integrations.openai.tool_registry import ToolRegistry
from app.services.openai.openai_service import OpenAIService


class RecordingClient:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def create_response(self, *, model: str, input_text: str, tools: list[dict[str, object]] | None = None) -> dict[str, object]:
        self.calls.append({"model": model, "input_text": input_text, "tools": tools or []})
        return {"id": "abc", "model": model, "output_text": input_text, "status": "ok", "tools": tools or []}


class FakeTransport:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def post(self, *, url: str, json: dict[str, object]) -> dict[str, object]:
        self.calls.append({"url": url, "json": json})
        return {"id": "resp-1", "model": json["model"], "output_text": json["input"][0]["content"], "status": "ok", "tools": json.get("tools", [])}


def test_prompt_manager_and_service_work_with_injected_dependencies() -> None:
    prompt_manager = PromptManager([PromptTemplate("context", "Summarize: {context}")])
    tool_registry = ToolRegistry()
    tool_registry.register("search_context", lambda: None)
    client = RecordingClient()
    service = OpenAIService(
        client=client,
        prompt_manager=prompt_manager,
        tool_registry=tool_registry,
        response_parser=ResponseParser(),
    )

    result = service.execute(prompt_name="context", context="site health")

    assert result["output_text"] == "Summarize: site health"
    assert result["status"] == "ok"
    assert client.calls[0]["model"] == "gpt-4o-mini"


def test_openai_client_uses_injected_transport(monkeypatch) -> None:
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    transport = FakeTransport()
    client = OpenAIClient(api_key="test-key", transport=transport)

    response = client.create_response(model="gpt-4o-mini", input_text="hi")

    assert response["status"] == "ok"
    assert response["output_text"] == "hi"
    assert transport.calls[0]["json"]["model"] == "gpt-4o-mini"


def test_tool_registry_and_parser_work_together() -> None:
    tool_registry = ToolRegistry()
    tool_registry.register("search_context", lambda: "result")
    parser = ResponseParser()
    parsed = parser.parse({"id": "123", "model": "gpt-4o", "output_text": "hello", "status": "ok", "tools": tool_registry.get_tools()})

    assert parsed["id"] == "123"
    assert parsed["tools"][0]["name"] == "search_context"


def test_prompt_manager_raises_for_missing_template() -> None:
    prompt_manager = PromptManager([])

    try:
        prompt_manager.get_prompt("missing")
    except KeyError as exc:
        assert "missing" in str(exc)
    else:
        raise AssertionError("expected KeyError")
