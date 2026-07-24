class DefaultAuthorizationProvider:
    async def authorize(self, action: str, principal: str, scopes: list[str]) -> bool:
        return "connector:admin" in scopes or action in {"read", "discover", "health"}