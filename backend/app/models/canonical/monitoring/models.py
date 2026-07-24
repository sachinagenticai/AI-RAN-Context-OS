from pydantic import Field

from app.models.canonical.base import CanonicalEntityModel
from app.models.enums.common import AlarmState, HealthState, Severity


class MonitoringEntity(CanonicalEntityModel):
    metric_name: str = Field(default="generic")
    value: float | int | str | None = None
    unit: str = Field(default="")


class CanonicalAlarm(MonitoringEntity):
    entity_type: str = "canonical_alarm"
    severity: Severity = Severity.MAJOR
    alarm_state: AlarmState = AlarmState.ACTIVE


class CanonicalAlert(MonitoringEntity):
    entity_type: str = "canonical_alert"
    severity: Severity = Severity.WARNING


class CanonicalMetric(MonitoringEntity):
    entity_type: str = "canonical_metric"


class CanonicalKPI(MonitoringEntity):
    entity_type: str = "canonical_kpi"


class CanonicalTelemetry(MonitoringEntity):
    entity_type: str = "canonical_telemetry"


class CanonicalCounter(MonitoringEntity):
    entity_type: str = "canonical_counter"


class CanonicalHealth(MonitoringEntity):
    entity_type: str = "canonical_health"
    health_state: HealthState = HealthState.HEALTHY


class CanonicalLog(MonitoringEntity):
    entity_type: str = "canonical_log"
    message: str = Field(default="")


class CanonicalPerformance(MonitoringEntity):
    entity_type: str = "canonical_performance"


class CanonicalAvailability(MonitoringEntity):
    entity_type: str = "canonical_availability"