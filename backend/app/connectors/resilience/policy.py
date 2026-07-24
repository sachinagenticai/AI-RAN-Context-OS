class ResiliencePolicy:
    def __init__(self, failure_threshold: int = 3) -> None:
        self._failure_threshold = failure_threshold
        self._failures: dict[str, int] = {}

    async def record_success(self, connector_id: str) -> None:
        self._failures[connector_id] = 0

    async def record_failure(self, connector_id: str) -> None:
        self._failures[connector_id] = self._failures.get(connector_id, 0) + 1

    async def is_available(self, connector_id: str) -> bool:
        return self._failures.get(connector_id, 0) < self._failure_threshold