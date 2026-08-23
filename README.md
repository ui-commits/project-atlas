# Project Atlas

[![CI](https://github.com/ui-commits/project-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/ui-commits/project-atlas/actions/workflows/ci.yml)

Project Atlas is a static, accessible registry of creative-engineering projects. It presents each project as an accession: a concise record on the atlas home page and a dedicated dossier at `/projects/[slug]`.

The site is built with Astro, TypeScript, Zod-validated Markdown content, and plain CSS custom properties. It ships as static HTML and is deployed to Vercel.

## What it provides

- A filterable registry of project cards, ordered by immutable accession ID.
- A static dossier page for every project record.
- Typed Markdown content with controlled vocabularies for categories, statuses, availability, and artifacts.
- Live-project actions, source links, artifact links, and a sandboxed iframe preview when embedding is allowed by the target site.
- A resilient visual hierarchy: local thumbnails take priority, remote Microlink screenshots are a fallback, and procedural SVG registry plates render when no image is available.
- Persistent header navigation, URL-backed category filtering, view transitions, skip navigation, visible focus states, reduced-motion support, and responsive layouts.

## Quick start

### Prerequisites

- Node.js 20 or newer (CI uses Node 20).
- npm (the lockfile is authoritative).

### Install and run

```bash
npm ci
npm run dev
```

Astro prints the local URL, normally `http://localhost:4321`.

### Verify a change

```bash
npm run check
npm run build
npm run preview
npm run check:links
```

`npm run check` runs Astro and TypeScript diagnostics. `npm run build` validates the content collection and creates the deployable static site in `dist/`. Use `npm run preview` to inspect that production build locally. `npm run check:links` validates internal routes in `dist/` and external URLs; it retries transient failures and only fails on confirmed broken links.

## Project structure

```text
src/
  components/        Reusable Astro UI components
  content/projects/  One Markdown record per accession
  layouts/           Shared HTML document shell and client controllers
  lib/               Display mappings and procedural registry-plate helpers
  pages/             Home, archive, and static dossier routes
  schemas/           Zod schema and controlled vocabularies
  styles/            Tokens, reset, type, and global styles
  content.config.ts  Astro Content Layer collection definition
.github/
  workflows/ci.yml   Check-and-build workflow
  ISSUE_TEMPLATE/    Content-maintenance issue template
  pull_request_template.md
ARCHITECTURE.md       System design and runtime behavior
AGENTS.md             Repository instructions for coding agents
HANDOFF.md            Historical inventory and deployment handoff
```

## Content model

Every file in `src/content/projects/` becomes one project. Its filename is its stable URL slug:

```text
src/content/projects/example-project.md
                         ^ dossier URL: /projects/example-project
```

The frontmatter is validated by `src/schemas/project.ts`. Required fields are:

```yaml
---
title: Example Project
registryId: PRJ-020
category: developer-tools
status: in-progress
availability: pending
year: 2026
lastVerified: 2026-08-23
summary: A short, plain-language description for the project card.
whyItMatters: Why this project matters in the broader registry.
tags:
  - Astro
  - TypeScript
artifacts: []
---
```

Optional fields are `featured`, `liveUrl`, `githubUrl`, `thumbnail`, `related`, and `artifacts`. URLs must be complete, valid URLs. If a source or artifact is private, unavailable, or not yet confirmed, omit its URL rather than adding a guessed or dead link.

### Controlled vocabulary

| Field | Valid values |
| --- | --- |
| `status` | `live`, `in-progress`, `local`, `archive` |
| `availability` | `public`, `private`, `pending` |
| `category` | `ui-systems`, `runtime-systems`, `agents-automation`, `tools-analysis`, `developer-tools`, `creative-experiments`, `personal-context` |
| artifact `type` | `readme`, `architecture`, `design-notes`, `technical-article`, `demo`, `source`, `screenshots`, `changelog` |
| artifact `visibility` | `public`, `private`, `pending` |

Registry IDs must match `PRJ-001` through `PRJ-999`. Assign the next unused ID and never reuse an ID from an archived record. The schema validates format, but uniqueness across files is a maintainer responsibility until a cross-record validation check is added.

### Images and screenshots

Use a local thumbnail whenever possible:

```yaml
thumbnail:
  src: /images/example-project.webp
  alt: Screenshot of Example Project showing its main workspace
  width: 1600
  height: 1000
```

The current UI falls back to a Microlink screenshot for live projects without a thumbnail, then to a generated SVG `RegistryPlate` if the remote screenshot fails. Remote screenshots are convenient but are not guaranteed; local, committed images are the durable option.

#### Capture local thumbnails

Playwright captures every record with a `liveUrl` into `public/images/projects/` at exactly 1600 × 1000 pixels (16:10), writes WebP at quality 82, and adds a `thumbnail` block to records that do not yet have one.

```bash
# Capture records that do not yet have a local image.
npm run capture:thumbnails

# Re-capture every live record.
npm run capture:thumbnails -- --force

# Re-capture one record.
npm run capture:thumbnails -- --slug agentos --force
```

The script writes `public/images/projects/capture-report.json` and exits non-zero when one or more targets fail. Review every capture before committing: remove cookie banners or sensitive information, confirm the screen represents the project well, improve the generated alt text where needed, and rerun the build. A failed capture leaves existing frontmatter unchanged and continues with the remaining records.

## Routes and behavior

| Route | Purpose |
| --- | --- |
| `/` | All accessions, category filter, session status, and card grid |
| `/?category=<category>` | Home page with a category filter applied |
| `/projects/[slug]` | Static project dossier generated from a Markdown record |
| `/archive` | Records whose status is `archive` or `local` |

The shared header is present on every route. On the home page it filters cards in place and updates the URL. On other routes it navigates to the filtered home page. The interactive preview is best effort: some third-party sites prevent iframe embedding, so the primary “Open Live Project” link must remain available.

## Development workflow

1. Create a focused branch and make the smallest complete change.
2. For new content, add a Markdown record and verify its ID, slug, URLs, `lastVerified` date, and copy.
3. For UI work, test desktop, narrow mobile, keyboard navigation, and reduced-motion behavior.
4. Run `npm run check` and `npm run build`.
5. Open the built site with `npm run preview` for visual review.
6. Open a pull request using the repository template.

GitHub Actions repeats the install, type check, and static build on pull requests and pushes to `main`. It uploads `dist/` as a short-lived artifact.

## Deployment

Astro is configured for static output in `astro.config.ts`. Vercel runs the normal npm install and `npm run build`, then serves `dist/`.

Before releasing:

1. Confirm CI is green.
2. Review the production build locally.
3. Verify intended public access and the production alias from an unauthenticated browser.
4. Confirm a representative card, filter, dossier, live-project link, and source link in production.
5. Record any material deployment detail in `HANDOFF.md` or the pull request.

Do not commit Vercel credentials, bypass tokens, or local `.vercel` state.

## Documentation

- [Architecture](ARCHITECTURE.md) explains content flow, rendering, client-side behavior, styling, and deployment boundaries.
- [Agent guide](AGENTS.md) gives implementation constraints and a verification checklist for coding agents and contributors.
- [Historical handoff](HANDOFF.md) records the original accession inventory and deployment context.

## License and ownership

This repository is private. Do not assume a public license or redistribute project screenshots, copy, or linked artifacts without the owner’s approval.
