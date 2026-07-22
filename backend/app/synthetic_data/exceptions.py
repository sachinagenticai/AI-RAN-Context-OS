from __future__ import annotations


class SyntheticDataError(Exception):
    """Base exception for synthetic data framework failures."""


class ConfigurationError(SyntheticDataError):
    """Raised when framework configuration is invalid."""


class ValidationError(SyntheticDataError):
    """Raised when input or output validation fails."""


class ExportError(SyntheticDataError):
    """Raised when exporting generated content fails."""


class UnsupportedFormatError(SyntheticDataError):
    """Raised when an unsupported output format is requested."""
