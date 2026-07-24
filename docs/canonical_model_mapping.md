# Canonical Model Mapping

## Mapping Strategy
Vendor-specific connectors do not expose vendor payloads to the platform core. A vendor mapper converts raw records into canonical entities using a canonical factory.

## Current Abstractions
- `VendorMapper`
- `MockVendorMapper`
- `MapperRegistry`
- `CanonicalConverterService`

## Supported Future Mapper Families
- Ericsson
- Nokia
- Huawei
- Samsung
- Cisco
- Juniper
- ServiceNow
- Jira
- SAP
- Azure
- AWS
- Kafka
- OpenAI
- Synthetic