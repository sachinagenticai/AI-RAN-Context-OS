"""
OpenAI integration service for context analysis with structured JSON responses.

Provides high-level functions for generating AI-powered context analysis
using the official OpenAI Python SDK with guaranteed JSON schema validation.
"""

import json
import logging
import os
from typing import Optional

from openai import OpenAI, APIConnectionError, APIStatusError, AuthenticationError


logger = logging.getLogger(__name__)


class OpenAIServiceError(Exception):
    """Raised when OpenAI service encounters an error."""
    pass


class ContextAnalysisResponse:
    """Structured response from context analysis."""

    def __init__(
        self,
        executive_summary: str,
        root_cause_summary: str,
        recommended_actions: list[str],
        risk_assessment: str,
        confidence: float,
    ):
        self.executive_summary = executive_summary
        self.root_cause_summary = root_cause_summary
        self.recommended_actions = recommended_actions
        self.risk_assessment = risk_assessment
        self.confidence = max(0.0, min(1.0, confidence))  # Clamp to [0, 1]

    @staticmethod
    def from_dict(data: dict) -> "ContextAnalysisResponse":
        """Validate and construct from dict."""
        if not isinstance(data, dict):
            raise ValueError("Response must be a dictionary")

        # Validate required fields
        required_fields = {"executive_summary", "root_cause_summary", "recommended_actions", "risk_assessment", "confidence"}
        missing = required_fields - set(data.keys())
        if missing:
            raise ValueError(f"Missing required fields: {missing}")

        # Validate types
        if not isinstance(data["executive_summary"], str):
            raise ValueError("executive_summary must be string")
        if not isinstance(data["root_cause_summary"], str):
            raise ValueError("root_cause_summary must be string")
        if not isinstance(data["recommended_actions"], list):
            raise ValueError("recommended_actions must be list")
        if not all(isinstance(a, str) for a in data["recommended_actions"]):
            raise ValueError("All recommended_actions items must be strings")
        if not isinstance(data["risk_assessment"], str):
            raise ValueError("risk_assessment must be string")
        if not isinstance(data["confidence"], (int, float)):
            raise ValueError("confidence must be number")

        return ContextAnalysisResponse(
            executive_summary=data["executive_summary"],
            root_cause_summary=data["root_cause_summary"],
            recommended_actions=data["recommended_actions"],
            risk_assessment=data["risk_assessment"],
            confidence=float(data["confidence"]),
        )


class OpenAIContextService:
    """Service for generating context analysis using OpenAI API with JSON validation."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize OpenAI service.

        Args:
            api_key: OpenAI API key. If None, reads from OPENAI_API_KEY environment variable.
            model: Model to use for analysis. Defaults to gpt-4o-mini.
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        if not self.api_key:
            logger.warning("OPENAI_API_KEY environment variable not set. Service will not work.")

        self.client = OpenAI(api_key=self.api_key) if self.api_key else None

    def generate_context_analysis(self, context: str) -> ContextAnalysisResponse:
        """
        Generate AI-powered context analysis with structured JSON response.

        Args:
            context: The context string to analyze.

        Returns:
            ContextAnalysisResponse with validated JSON fields.

        Raises:
            OpenAIServiceError: If API call fails, API key not configured, or JSON is invalid.
        """
        if not self.client:
            raise OpenAIServiceError("OpenAI API key not configured. Set OPENAI_API_KEY environment variable.")

        json_schema = """{
  "executive_summary": "Business-focused summary for leadership (1-2 sentences)",
  "root_cause_summary": "Technical root cause analysis",
  "recommended_actions": ["Action 1", "Action 2", "Action N"],
  "risk_assessment": "Risk level and mitigation strategy",
  "confidence": 0.85
}"""

        system_prompt = """You are an expert telecom network context analyst specializing in Nokia AI-RAN operations.

Analyze the provided network context and return a JSON response with exactly this structure:

""" + json_schema + """

Rules:
- Return ONLY valid JSON, no additional text
- confidence must be a number between 0 and 1
- recommended_actions must be a list of strings
- Be concise but specific to the incident
- Focus on actionable insights"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": system_prompt,
                    },
                    {
                        "role": "user",
                        "content": f"Analyze this network context:\n\n{context}",
                    },
                ],
                temperature=0.7,
                max_tokens=1024,
            )

            response_text = response.choices[0].message.content
            if not response_text:
                raise OpenAIServiceError("Empty response from OpenAI API")

            # Parse JSON response
            try:
                response_json = json.loads(response_text)
            except json.JSONDecodeError as e:
                error_msg = f"OpenAI returned invalid JSON: {e}\nResponse: {response_text[:200]}"
                logger.error(error_msg)
                raise OpenAIServiceError(error_msg) from e

            # Validate and construct response
            try:
                return ContextAnalysisResponse.from_dict(response_json)
            except ValueError as e:
                error_msg = f"OpenAI response validation failed: {e}\nResponse: {response_json}"
                logger.error(error_msg)
                raise OpenAIServiceError(error_msg) from e

        except AuthenticationError as e:
            error_msg = f"Authentication failed: {e}. Check OPENAI_API_KEY is valid."
            logger.error(error_msg)
            raise OpenAIServiceError(error_msg) from e
        except APIConnectionError as e:
            error_msg = f"Connection error: {e}. Check internet connection and OpenAI API status."
            logger.error(error_msg)
            raise OpenAIServiceError(error_msg) from e
        except APIStatusError as e:
            error_msg = f"API error: {e}. Status: {e.status_code}"
            logger.error(error_msg)
            raise OpenAIServiceError(error_msg) from e
        except OpenAIServiceError:
            raise
        except Exception as e:
            error_msg = f"Unexpected error generating context analysis: {e}"
            logger.error(error_msg)
            raise OpenAIServiceError(error_msg) from e
