class ConnectorError(Exception):
    """Base exception for the universal connector framework."""


class ConnectorRegistrationError(ConnectorError):
    """Raised when connector registration fails."""


class ConnectorNotFoundError(ConnectorError):
    """Raised when a connector cannot be found."""


class ConnectorConfigurationError(ConnectorError):
    """Raised when a connector configuration is invalid."""


class ConnectorLifecycleError(ConnectorError):
    """Raised when connector lifecycle execution fails."""


class ConnectorPluginError(ConnectorError):
    """Raised when plugin loading fails."""