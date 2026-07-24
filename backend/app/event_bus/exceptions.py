class EventBusError(Exception):
    """Base exception for the enterprise event bus."""


class EventBusValidationError(EventBusError):
    """Raised when a canonical event payload is invalid."""


class EventBusNotFoundError(EventBusError):
    """Raised when a topic or subscription cannot be found."""


class EventBusPluginError(EventBusError):
    """Raised when a plugin cannot be loaded."""