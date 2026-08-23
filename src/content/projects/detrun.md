---
title: "DetRun"
registryId: "PRJ-010"
category: "agents-automation"
status: "local"
availability: "pending"
featured: false
year: 2026
summary: "A deterministic agent task runner that enforces reproducible execution by hashing inputs, pinning tool versions, and journaling every step of an agent's decision path."
whyItMatters: "Eliminates the non-determinism problem in agentic pipelines by treating each run as a verifiable artifact — enabling replay, diffing, and CI regression testing of agent behavior."
tags:
  - "Agents"
  - "Determinism"
  - "TypeScript"
  - "Task Runner"
  - "Reproducibility"
artifacts:
  - label: "README"
    type: "readme"
    visibility: "pending"
  - label: "Architecture"
    type: "architecture"
    visibility: "pending"
related:
  - "agentos"
  - "xstatepro"
  - "xx-ledger-orchestrator"
---

DetRun enforces deterministic execution across agentic task pipelines — hashing all inputs and tool outputs, pinning execution context at the start of each run, and producing a cryptographically verifiable journal of every decision step.

### Core Capabilities

- **Input Hashing:** All task inputs are content-addressed at run start, ensuring the same logical input always produces an identical execution signature.
- **Step Journal:** Full append-only log of agent decisions, tool calls, and intermediate outputs per run — enabling precise replay and branch comparison.
- **Version-Pinned Execution:** Tool registry resolved at run initiation, preventing mid-run version drift from contaminating result reproducibility.
