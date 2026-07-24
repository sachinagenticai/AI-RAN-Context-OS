class EventBusError(Exception):
    """Base exception for the enterprise event bus."""


class EventValidationError(EventBusError):
    """Raised when an event payload is invalid."""


class EventNotFoundError(EventBusError):
    """Raised when an event or topic cannot be found."""


class EventDispatchError(EventBusError):
    """Raised when event dispatch fails."""


class EventDeadLetterError(EventBusError):
    """Raised when events are routed to the DLQ."""