class PolicyError(Exception):
    """Base exception for policy errors."""


class PolicyValidationError(PolicyError):
    """Raised when a policy payload is invalid."""


class PolicyLoadError(PolicyError):
    """Raised when policies cannot be loaded."""
