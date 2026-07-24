# Connector Interfaces

## Core Runtime Interfaces
- Connector
- StreamingConnector
- PollingConnector
- MessageConnector
- ApiConnector
- DatabaseConnector
- FileConnector
- CloudConnector

## Domain Interfaces
- TelemetryConnector
- InventoryConnector
- TicketConnector
- EventConnector

## Support Interfaces
- HealthCheck
- AuthenticationProvider
- AuthorizationProvider
- SchemaProvider
- MetadataProvider
- CapabilityProvider
- DiscoveryProvider
- Lifecycle
- ConfigurationProvider
- TransformationProvider
- Mapper
- Validator
- Serializer
- Deserializer
- EventPublisher
- EventSubscriber
- MetricsCollector
- RetryStrategy
- CacheProvider

## Intent
These interfaces define a stable async SDK contract so future integrations with OSS/BSS, cloud, observability, ITSM, and streaming systems can be added without changing the core platform packages.