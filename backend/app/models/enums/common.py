from enum import Enum


class Severity(str, Enum):
    CRITICAL = "Critical"
    MAJOR = "Major"
    MINOR = "Minor"
    WARNING = "Warning"
    INFO = "Info"


class Priority(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"
    P4 = "P4"


class AlarmState(str, Enum):
    ACTIVE = "Active"
    CLEARED = "Cleared"
    ACKNOWLEDGED = "Acknowledged"


class NodeState(str, Enum):
    ACTIVE = "Active"
    DEGRADED = "Degraded"
    MAINTENANCE = "Maintenance"
    OFFLINE = "Offline"


class HealthState(str, Enum):
    HEALTHY = "Healthy"
    WARNING = "Warning"
    DEGRADED = "Degraded"
    DOWN = "Down"


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class ApprovalStatus(str, Enum):
    APPROVED = "Approved"
    REJECTED = "Rejected"
    PENDING = "Pending"
    HUMAN_REVIEW = "Human Review"


class WorkflowStatus(str, Enum):
    CREATED = "Created"
    RUNNING = "Running"
    COMPLETED = "Completed"
    FAILED = "Failed"
    CANCELLED = "Cancelled"


class IncidentStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class EventType(str, Enum):
    TELEMETRY = "telemetry"
    ALARM = "alarm"
    METRIC = "metric"
    TICKET = "ticket"
    WORKFLOW = "workflow"
    AI = "ai"
    GENERIC = "generic"


class ConnectorType(str, Enum):
    SYNTHETIC = "synthetic"
    REST = "rest"
    WEBHOOK = "webhook"
    CSV = "csv"
    FILE = "file"
    KAFKA_MOCK = "kafka_mock"
    OPENAI_WRAPPER = "openai_wrapper"


class VendorType(str, Enum):
    ERICSSON = "Ericsson"
    NOKIA = "Nokia"
    HUAWEI = "Huawei"
    SAMSUNG = "Samsung"
    CISCO = "Cisco"
    JUNIPER = "Juniper"
    MAVENIR = "Mavenir"
    PARALLEL_WIRELESS = "Parallel Wireless"
    SERVICENOW = "ServiceNow"
    JIRA = "Jira"
    SAP = "SAP"
    AZURE = "Azure"
    AWS = "AWS"
    GOOGLE_CLOUD = "Google Cloud"
    KAFKA = "Kafka"
    OPENAI = "OpenAI"
    SYNTHETIC = "Synthetic"
    GENERIC = "Generic"