# Synthetic Data Context Builder

The context builder composes inventory, KPI, alarm, and weather inputs into a single structured context object.

## Usage

```python
from app.synthetic_data.services.context_builder import ContextBuilder

builder = ContextBuilder()
context = builder.build_context(
    entity_id="site-001",
    entity_type="site",
    inventory={"technology": "5G", "carrier": "Operator A", "band": "n78", "sector_count": 3},
    kpis={"avg_rsrp": -105, "avg_sinr": 12, "availability": 0.99, "throughput": 250},
    alarms={"count": 2, "severity": "Major", "types": ["Power Alarm", "Interference"]},
    weather={"temperature_c": 28, "wind_kph": 12, "condition": "clear"},
)
```

The builder keeps orchestration logic in the service layer and returns a validated Pydantic context model for downstream use.
