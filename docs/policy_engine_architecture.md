# Policy & Governance Engine Architecture

## Overview
The Policy & Governance Engine evaluates reasoning outputs and determines whether an action should be approved, rejected, or sent for human review.

## Components
- PolicyLoader: loads policies from YAML or JSON files.
- PolicyEvaluationEngine: evaluates reasoning output against enabled policies.
- DefaultPolicyStrategy: applies simple deterministic rule matching.
- Policy models: represent policy, rules, violations, version, and approval decisions.

## Design Principles
- Clean Architecture
- SOLID
- Stateless services
- Pydantic V2 models
- Dependency injection
- Typed models for governance contracts

## Flow
1. Load policies from a YAML or JSON file.
2. Receive reasoning output from the Reasoning Engine.
3. Evaluate rules against the reasoning context.
4. Produce a governance decision with matched rules and violations.
5. Return a structured policy evaluation response.
