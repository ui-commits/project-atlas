---
title: "Meridian / Agent Studio OS"
registryId: "PRJ-007"
category: "agents-automation"
status: "local"
availability: "pending"
featured: false
year: 2026
summary: "A local-first agent orchestration studio providing a visual canvas for composing, wiring, and monitoring multi-agent pipelines with real-time execution tracing."
whyItMatters: "Removes the friction of building complex agent topologies by giving engineers a structured visual workspace that maps directly to runtime behavior — making orchestration logic inspectable before it ships."
tags:
  - "Agents"
  - "Orchestration"
  - "Visual Canvas"
  - "TypeScript"
  - "Local-First"
artifacts:
  - label: "README"
    type: "readme"
    visibility: "pending"
  - label: "Architecture"
    type: "architecture"
    visibility: "pending"
related:
  - "agentOS"
  - "detrun"
  - "xstatepro"
---

Meridian / Agent Studio OS is a local-first visual environment for designing and running multi-agent systems — providing a drag-and-wire canvas that renders agent graphs, message flows, and execution traces in a single unified surface.

### Core Capabilities

- **Visual Agent Graph:** Node-based canvas where agents, tools, and memory stores are first-class draggable primitives with typed connection ports.
- **Real-Time Execution Tracing:** Live trace panel synchronized to the canvas selection state — click a node, see its last N message exchanges, latency, and token cost.
- **Pipeline Serialization:** Graphs export to a versioned JSON schema, enabling headless replay and CI-level regression testing of agent pipelines.
