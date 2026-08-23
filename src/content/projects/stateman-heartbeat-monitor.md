---
title: "StateMan / Heartbeat Monitor"
registryId: "PRJ-009"
category: "tools-analysis"
status: "local"
availability: "pending"
featured: false
year: 2026
summary: "A deterministic state machine manager paired with a real-time heartbeat monitoring surface, enabling fine-grained visibility into state transitions and system liveness across distributed services."
whyItMatters: "Pairs the correctness guarantees of formal state machines with an operational health dashboard — so teams can prove their services are in a valid state, not just that they're responding to pings."
tags:
  - "State Machines"
  - "Monitoring"
  - "TypeScript"
  - "Telemetry"
  - "Distributed Systems"
artifacts:
  - label: "README"
    type: "readme"
    visibility: "pending"
  - label: "Architecture"
    type: "architecture"
    visibility: "pending"
related:
  - "runtimedistr"
  - "xstatepro"
  - "detrun"
---

StateMan / Heartbeat Monitor combines a deterministic XState-compatible state machine registry with a live heartbeat dashboard — surfacing exactly which services are alive, which state they occupy, and which transitions they've recently traversed.

### Core Capabilities

- **State Machine Registry:** Centralized store for active machine instances with transition history, current state snapshot, and event log per registered service.
- **Heartbeat Dashboard:** Real-time liveness grid with configurable thresholds — distinguishing between stalled machines and truly offline services.
- **Transition Diffing:** Side-by-side comparison of state transition paths between two time windows, revealing drift and regression in service behavior.
