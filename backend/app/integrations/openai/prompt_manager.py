from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class PromptTemplate:
    name: str
    template: str


class PromptManager:
    """Manage prompt templates for the Responses API."""

    def __init__(self, templates: list[PromptTemplate] | None = None) -> None:
        self._templates = {template.name: template for template in (templates or [])}

    def get_prompt(self, name: str, *, context: str | None = None) -> str:
        template = self._templates.get(name)
        if template is None:
            raise KeyError(f"Prompt template '{name}' not found")
        if context is None:
            return template.template
        return template.template.format(context=context)
