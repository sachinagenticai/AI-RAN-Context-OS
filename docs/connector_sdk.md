# Connector SDK

## Extension Model
Future connector authors implement minimal code by:

1. Choosing the correct base connector class.
2. Supplying a `ConnectorConfiguration`.
3. Implementing async transport-specific methods.
4. Registering a builder with `ConnectorFactory`.

## Base Classes
- `BaseConnector`
- `BaseStreamingConnector`
- `BasePollingConnector`
- `BaseFileConnector`
- `BaseApiConnector`
- `BaseDatabaseConnector`
- `BaseMessageConnector`
- `BaseCloudConnector`

## Builder Contract
A builder receives:
- connector identifier
- connector configuration
- framework dependencies

It returns an initialized connector instance ready for registry lifecycle management.

## Canonical Transformation
Raw vendor payloads are transformed into a canonical model before downstream use. Current mock profiles include Ericsson, Nokia, Huawei, Samsung, Cisco, Juniper, Mavenir, Parallel Wireless, and Synthetic.