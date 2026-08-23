# Project Atlas — Session 1 Handoff Document

**Date:** 2026-08-22  
**Status:** Session 1 Completed • Clean Build • Zero Errors  
**Root Path:** `C:\code\github.com\personal\project-atlas`  
**GitHub Org Target:** `ui-commits`  

---

## 1. Executive Summary

Project Atlas is a static, deployable project atlas and registry showcasing ~20 creative-engineering systems (runtime visualization, deterministic state machines, forest-intelligence design systems, and agent orchestration kernels).

Phase 1 scaffold, design system tokens, strict content schemas, and the 4 featured project accessions are fully built, typed, and statically verified with Astro 5.

---

## 2. Architecture & Tech Stack

- **Framework:** Astro 5.x (`output: 'static'`, pure SSG)
- **Language / Typing:** Strict TypeScript (`noUncheckedIndexedAccess: true`)
- **Content Engine:** Astro Content Collections (Astro 5 glob loader) + Zod validation
- **Design System:** Pure CSS Custom Properties with AICG/PNW field-survey palette (no Tailwind / no external UI kit)
- **Typography:** Self-hosted `@fontsource-variable/instrument-sans` (prose/headings) + `@fontsource/ibm-plex-mono` (registry IDs, stamps, metadata)
- **Image Strategy:** Responsive 16:10 ratio with procedural `RegistryPlate` contour SVG fallbacks for records without thumbnails
- **Deployment Target:** Vercel Static (no `vercel.json` or server adapters needed)

---

## 3. Directory Structure

```text
C:\code\github.com\personal\project-atlas\
├── .gitignore
├── astro.config.ts                     # output: 'static', site url configured
├── package.json                        # Astro 5, Zod, Fontsource packages
├── tsconfig.json                       # extends astro/tsconfigs/strict + noUncheckedIndexedAccess
├── src/
│   ├── content.config.ts               # Content layer glob loader for 'projects' collection
│   ├── schemas/
│   │   └── project.ts                  # Zod schema, types (ProjectRecord, ArtifactRecord, etc.)
│   ├── lib/
│   │   └── registry.ts                 # Registry labels, maps, deterministic SVG contour generator
│   ├── styles/
│   │   ├── reset.css                   # Modern 100dvh reset, prefers-reduced-motion
│   │   ├── tokens.css                  # AICG/PNW light theme custom properties
│   │   ├── tokens-dark.css             # Dark theme token overrides (data-theme="dark")
│   │   ├── typography.css              # Font pairing, scale, mono & label utility classes
│   │   └── global.css                  # Cascade orchestrator and site shell styles
│   ├── layouts/
│   │   └── BaseLayout.astro            # Root HTML shell, skip link, header, footer
│   ├── components/
│   │   ├── StatusStamp.astro           # Outline-only LIVE / IN PROGRESS / LOCAL / ARCHIVE stamp
│   │   ├── RegistryPlate.astro         # 16:10 seeded terrain contour fallback with watermark
│   │   ├── ArtifactLink.astro          # Safe artifact pill (prevents dead links for private/pending)
│   │   └── ProjectCard.astro           # Bounded record plate with separate action targets
│   ├── pages/
│   │   ├── index.astro                 # Survey hero + Featured Accessions grid
│   │   └── projects/
│   │       └── [slug].astro            # Dynamic dossier detail route (getStaticPaths)
│   └── content/
│       └── projects/
│           ├── runtimedistr.md         # PRJ-001 (Featured)
│           ├── chromatic-topology.md   # PRJ-002 (Featured)
│           ├── neo-ui-kit.md           # PRJ-003 (Featured)
│           └── oswego-park-ui-kit.md   # PRJ-004 (Featured)
└── dist/                               # Generated static distribution
```

---

## 4. Content Schema & Validation Rules

Defined in `src/schemas/project.ts`:

| Field | Type | Validation / Constraints |
|---|---|---|
| `title` | `string` | Required |
| `registryId` | `string` | Regex `^PRJ-\d{3}$` (`PRJ-001` through `PRJ-999`). Immutable. |
| `category` | `enum` | `'ui-systems'`, `'runtime-systems'`, `'agents-automation'`, `'tools-analysis'`, `'developer-tools'`, `'creative-experiments'`, `'personal-context'` |
| `status` | `enum` | `'live'`, `'in-progress'`, `'local'`, `'archive'` |
| `availability` | `enum` | `'public'`, `'private'`, `'pending'` (separate from lifecycle status) |
| `featured` | `boolean` | Default `false` |
| `year` | `number` | Integer `2020`–`2030` |
| `summary` | `string` | 1–2 sentence overview |
| `whyItMatters` | `string` | Human explanation of technical/design innovation |
| `liveUrl` | `string (url)` | Optional |
| `githubUrl` | `string (url)` | Optional (omitted if source unverified) |
| `thumbnail` | `object` | Optional: `{ src: string, alt: string, width: number, height: number }` |
| `tags` | `string[]` | Default `[]` |
| `artifacts` | `array` | Array of `{ label, type, url?, description?, visibility }` |
| `related` | `string[]` | Optional array of project slugs for editorial overrides |

*Note: Slugs are derived directly from Markdown filenames (e.g. `runtimedistr.md` → `/projects/runtimedistr`).*

---

## 5. Master Registry Accession Plan

Sequential accession IDs assigned across the full inventory:

| ID | Project Name | Category | Status | In Repo |
|---|---|---|---|---|
| **PRJ-001** | RUNTIMEDISTR / Hermes C2 | `runtime-systems` | `live` | **Yes (Active)** |
| **PRJ-002** | Chromatic Topology UI | `runtime-systems` | `live` | **Yes (Active)** |
| **PRJ-003** | Neo UI Kit | `ui-systems` | `live` | **Yes (Active)** |
| **PRJ-004** | Oswego Park UI Kit | `ui-systems` | `live` | **Yes (Active)** |
| **PRJ-005** | Rosetta UI Kit | `ui-systems` | `live` | Pending S2 |
| **PRJ-006** | PNW / AICG UI Kit | `ui-systems` | `live` | Pending S2 |
| **PRJ-007** | Meridian / Agent Studio OS | `agents-automation` | `local` | Pending S2 |
| **PRJ-008** | AgentOS | `agents-automation` | `local` | Pending S2 |
| **PRJ-009** | StateMan / Heartbeat Monitor | `tools-analysis` | `local` | Pending S2 |
| **PRJ-010** | DetRun | `agents-automation` | `local` | Pending S2 |
| **PRJ-011** | Xstatepro | `agents-automation` | `local` | Pending S2 |
| **PRJ-012** | Xxrun | `creative-experiments` | `local` | Pending S2 |
| **PRJ-013** | XX Ledger Orchestrator | `agents-automation` | `local` | Pending S2 |
| **PRJ-014** | CodeCompare CLI / Night Forest | `tools-analysis` | `live` | Pending S2 |
| **PRJ-015** | Project Tool / Browser Editor | `developer-tools` | `live` | Pending S2 |
| **PRJ-016** | Neon Sky Audio Player | `creative-experiments` | `live` | Pending S2 |
| **PRJ-017** | DevProfile Terminal | `personal-context` | `live` | Pending S2 |
| **PRJ-018** | Voluble Babka | `personal-context` | `live` | Pending S2 |
| **PRJ-019** | devArticleAgentic | `agents-automation` | `archive` | Pending S2 |

---

## 6. Build & Verification Status

```bash
# Verify TypeScript & Astro Diagnostics
npm run check
# Output: Result (12 files): 0 errors, 0 warnings, 0 hints

# Verify SSG Production Build
npm run build
# Output: 5 page(s) built in 1.86s
#  └─ /index.html
#  ├─ /projects/runtimedistr/index.html
#  ├─ /projects/chromatic-topology/index.html
#  ├─ /projects/neo-ui-kit/index.html
#  └─ /projects/oswego-park-ui-kit/index.html
```

---

## 7. Next Steps for Next Session (Session 2)

1. **Populate Remaining Accessions (PRJ-005 through PRJ-019):**
   - Create Markdown files in `src/content/projects/` following verified metadata.
   - Enforce URL omission on unconfirmed GitHub links (Rosetta, Neo, Oswego, PNW).
2. **Category & Status Filter Component:**
   - Add vanilla JS filter bar on index for instant filtering across all categories.
3. **Archive Route:**
   - Add `src/pages/archive.astro` listing historical, local-only, and pending records.
4. **Git Repository Setup:**
   - Initialize git repo and prepare for remote push under `ui-commits/project-atlas`.
