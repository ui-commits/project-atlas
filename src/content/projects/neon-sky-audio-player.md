---
title: "Neon Sky Audio Player"
registryId: "PRJ-016"
category: "creative-experiments"
status: "live"
availability: "pending"
featured: false
year: 2026
summary: "A visually reactive audio player that renders real-time frequency and waveform visualizations driven by the Web Audio API, with a neon-on-dark aesthetic tuned for immersive listening interfaces."
whyItMatters: "Demonstrates that utility-class audio players can be experiences in their own right — using generative visualization to make the invisible structure of sound perceptible and engaging without sacrificing playback precision."
tags:
  - "Web Audio API"
  - "Generative"
  - "Creative Coding"
  - "TypeScript"
  - "Visualization"
artifacts:
  - label: "Demo"
    type: "demo"
    visibility: "pending"
  - label: "README"
    type: "readme"
    visibility: "pending"
related:
  - "xxrun"
  - "chromatic-topology"
---

Neon Sky Audio Player is a browser-native audio player with real-time generative visualization — rendering FFT frequency bars, waveform oscilloscopes, and particle fields driven live from the Web Audio API against a neon-on-deep-space visual palette.

### Core Capabilities

- **Web Audio API Pipeline:** Full audio graph with analyzer nodes feeding frequency and time-domain data to the visualization layer at 60fps with minimal latency overhead.
- **Layered Visualization:** Three simultaneous render layers (frequency spectrum, waveform, ambient particle field) composited on a shared canvas for visual depth.
- **Responsive Neon Palette:** Color and glow intensity mapped to audio amplitude and spectral centroid — the player visually responds to the character of the sound, not just its volume.
