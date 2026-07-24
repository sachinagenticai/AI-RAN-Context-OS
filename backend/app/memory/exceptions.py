class MemoryError(Exception):
    """Base exception for memory engine errors."""


class MemoryStorageError(MemoryError):
    """Raised when memory storage cannot fulfill an operation."""


class MemoryRetrievalError(MemoryError):
    """Raised when retrieval parameters are invalid."""
