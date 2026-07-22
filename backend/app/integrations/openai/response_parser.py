from __future__ import annotations

from typing import Any


class ResponseParser:
    """Parse Responses API payloads into a stable application shape."""

    def parse(self, response: dict[str, Any]) -> dict[str, Any]:
        output_text = response.get("output_text", "")
        if not output_text and isinstance(response.get("output"), list):
            output_text = response["output"][0].get("content", "")
        return {
            "id": response.get("id", ""),
            "model": response.get("model", ""),
            "output_text": output_text,
            "status": response.get("status", "unknown"),
            "tools": response.get("tools", []),
        }
