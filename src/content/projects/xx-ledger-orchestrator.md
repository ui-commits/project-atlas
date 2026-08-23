---
title: "XX Ledger Orchestrator"
registryId: "PRJ-013"
category: "agents-automation"
status: "local"
availability: "pending"
featured: false
year: 2026
summary: "An agent-driven ledger orchestration system that coordinates multi-step financial workflows through typed state machines, producing an immutable audit trail for every orchestrated transaction sequence."
whyItMatters: "Brings deterministic agent orchestration to financial record-keeping — where correctness, auditability, and rollback fidelity are non-negotiable requirements that ad-hoc automation cannot satisfy."
tags:
  - "Agents"
  - "Orchestration"
  - "Ledger"
  - "TypeScript"
  - "Audit Trail"
artifacts:
  - label: "README"
    type: "readme"
    visibility: "pending"
  - label: "Architecture"
    type: "architecture"
    visibility: "pending"
related:
  - "agentos"
  - "detrun"
  - "stateman-heartbeat-monitor"
---

XX Ledger Orchestrator applies agent orchestration patterns to structured financial workflows — coordinating multi-step ledger operations through typed state machines and appending every action to an immutable, cryptographically verifiable audit log.

### Core Capabilities

- **Typed Workflow Definitions:** Each ledger operation sequence defined as a named workflow with explicit entry conditions, step transitions, and terminal states.
- **Immutable Audit Log:** Every agent action — reads, writes, reconciliation steps — appended to a hash-chained log that cannot be retroactively modified.
- **Rollback Orchestration:** Failed workflow branches trigger structured rollback sequences rather than silent partial state, ensuring ledger consistency on error paths.
