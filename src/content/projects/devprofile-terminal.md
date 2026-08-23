---
title: "DevProfile Terminal"
registryId: "PRJ-017"
category: "personal-context"
status: "live"
availability: "pending"
featured: false
year: 2026
summary: "An interactive terminal-aesthetic developer portfolio that renders personal and professional context as a navigable CLI session, complete with typed command history, project queries, and skill manifests."
whyItMatters: "Treats the developer profile as a first-class interface artifact — matching the terminal-native aesthetic of the work it represents, while remaining accessible and readable to non-technical visitors."
tags:
  - "Portfolio"
  - "Terminal UI"
  - "TypeScript"
  - "Personal Context"
  - "Interactive"
artifacts:
  - label: "Demo"
    type: "demo"
    visibility: "pending"
  - label: "README"
    type: "readme"
    visibility: "pending"
related:
  - "voluble-babka"
  - "codecompare-cli-night-forest"
---

DevProfile Terminal renders a developer's professional context as an interactive terminal session — visitors type commands to query projects, read skill manifests, fetch contact info, and navigate a curated history of work, all rendered in a pixel-faithful terminal aesthetic.

### Core Capabilities

- **Command Interpreter:** A browser-side command parser supporting a curated set of profile commands (`ls projects`, `cat about`, `open resume`) with typed autocomplete and usage hints.
- **Queryable Project Registry:** Projects surfaced as structured terminal records, filterable by category, year, and status — matching the mental model of a local project directory.
- **Accessible Fallback:** Full semantic HTML content available to screen readers and crawlers beneath the terminal surface, ensuring the interface is indexable and accessible without JavaScript.
