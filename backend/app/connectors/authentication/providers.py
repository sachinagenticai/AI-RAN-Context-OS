from __future__ import annotations

from typing import Any


class NoAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {}


class OAuth2AuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"Authorization": f"Bearer mock-oauth2-token-{configuration.get('client_id', 'default')}"}


class JWTAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"Authorization": f"JWT mock-jwt-{configuration.get('issuer', 'default')}"}


class ApiKeyAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"X-API-Key": f"mock-api-key-{configuration.get('name', 'default')}"}


class BasicAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"Authorization": f"Basic mock-{configuration.get('username', 'user')}"}


class CertificateAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"X-Client-Cert": f"mock-cert-{configuration.get('subject', 'client')}"}


class BearerTokenAuthenticationProvider:
    async def authenticate(self, configuration: dict[str, Any]) -> dict[str, str]:
        return {"Authorization": f"Bearer mock-bearer-{configuration.get('token_name', 'token')}"}


def build_authentication_providers() -> dict[str, object]:
    return {
        "none": NoAuthenticationProvider(),
        "oauth2": OAuth2AuthenticationProvider(),
        "jwt": JWTAuthenticationProvider(),
        "api_key": ApiKeyAuthenticationProvider(),
        "basic": BasicAuthenticationProvider(),
        "certificate": CertificateAuthenticationProvider(),
        "bearer": BearerTokenAuthenticationProvider(),
    }