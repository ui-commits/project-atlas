---
title: "DetRun / Deterministic Workflow Runtime"
registryId: "PRJ-010"
category: "agents-automation"
status: "live"
availability: "public"
featured: true
year: 2026
lastVerified: "2026-08-23"
summary: "A deterministic workflow runtime for inspecting DAGs, state transitions, event history, metrics, and step-by-step time travel."
whyItMatters: "Provides tangible evidence of systems thinking: complex multi-stage execution plans can be stepped forward, rewound, inspected, and verified."
liveUrl: "https://detrun.vercel.app"
githubUrl: "https://github.com/ui-commits/DetRun"
tags:
  - "Deterministic"
  - "Workflows"
  - "DAG"
  - "State Machines"
  - "Time Travel"
artifacts:
  - label: "README"
    type: "readme"
    url: "https://github.com/ui-commits/DetRun#readme"
    visibility: "public"
  - label: "Source"
    type: "source"
    url: "https://github.com/ui-commits/DetRun"
    visibility: "public"
related:
  - "meridian-agent-studio-os"
  - "agentos"
  - "xxrun"
thumbnail:
  src: "/images/projects/detrun.webp"
  alt: "Screenshot of DetRun"
  width: 1600
  height: 1000
---

DetRun is a deterministic workflow orchestration engine built around DAG visualization, time-travel execution stepping, and circular-buffer telemetry metrics.

### Core Capabilities

- **Time-Travel Step Controls:** Scrub backwards and forwards through workflow execution states to inspect intermediate variable mutations.
- **Finite-State-Machine Inspection:** Visual transition graph highlighting active, pending, and failed states in real time.
- **Circular-Buffer Metrics:** High-frequency performance metrics retained in fixed-memory ring buffers for low-overhead runtime auditing.
