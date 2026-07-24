from __future__ import annotations

from app.connectors.factory.connector_factory import ConnectorFactory


class ConnectorPluginLoader:
    async def load(self, factory: ConnectorFactory, module_paths: list[str]) -> None:
        for module_path in module_paths:
            await factory.load_plugin(module_path)