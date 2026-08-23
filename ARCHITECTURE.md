# Architecture

## System overview

Project Atlas is a static Astro 5 application that turns validated Markdown files into a browseable registry and project dossiers. It intentionally has no server runtime, database, authentication layer, or client framework. Its durable source of truth is the Git repository.

```text
Markdown accession records
        |
        v
Astro Content Layer + Zod schema
        |
        +--> Home registry (`/`)
        +--> Static dossier routes (`/projects/[slug]`)
        +--> Archive view (`/archive`)
        |
        v
Astro static build (`dist/`)
        |
        v
Vercel static hosting
```

## Architectural goals

- Keep project data reviewable in version-controlled Markdown.
- Fail the build for malformed individual records.
- Make all primary content available without client-side rendering.
- Use small, local browser scripts only for progressive enhancement.
- Preserve a usable visual result when external screenshots or embedded sites fail.
- Maintain accessible navigation, focus, and motion behavior without a UI framework.

## Source-of-truth boundaries

| Concern | Source of truth | Notes |
| --- | --- | --- |
| Project metadata and long-form copy | `src/content/projects/*.md` | Filename determines slug and must remain stable once published. |
| Field validation and allowed values | `src/schemas/project.ts` | Zod validates every individual record at build time. |
| Collection loading | `src/content.config.ts` | Glob loader reads the project Markdown directory. |
| Display labels and plate algorithm | `src/lib/registry.ts` | Categories/statuses display through shared mappings. |
| Shared shell and browser controllers | `src/layouts/BaseLayout.astro` | Header filter, preview modal, and view-transition lifecycle. |
| Rendering | `src/pages/*.astro`, `src/components/*.astro` | Pages compose validated collection entries. |
| Visual system | `src/styles/` and component-scoped styles | CSS custom properties are the design API. |
| Deployment | `astro.config.ts`, Vercel project settings | No server adapter or environment variables are required today. |

## Content architecture

### Collection loading

`src/content.config.ts` declares one `projects` collection using Astro’s glob loader. Every `*.md` file under `src/content/projects/` is loaded. Astro assigns the file’s basename as `project.id`; routes use that ID as the slug.

Changing a filename therefore changes its public dossier URL. Prefer adding redirects at the hosting layer if a published slug must change.

### Schema

`projectSchema` requires human-facing basics (`title`, `summary`, `whyItMatters`), registry metadata (`registryId`, `category`, `status`, `availability`, `year`, `lastVerified`), and normalizes optional arrays such as `tags` and `artifacts` to empty arrays.

The schema protects a single record. It does **not** currently enforce cross-record invariants such as unique `registryId`, valid `related` references, or freshness of `lastVerified`. Those need a collection-level validation step if automation becomes necessary.

### Data flow

```text
project.md frontmatter + body
            |
            v
projectSchema parses frontmatter
            |
            v
getCollection('projects')
     |              |              |
     v              v              v
index.astro    [slug].astro    archive.astro
card grid      dossier page    archive/local filter
```

The home page sorts by `registryId`. The archive page selects `archive` and `local` statuses. `getStaticPaths()` creates one static dossier page per collection entry during the build.

## Rendering model

### Static-first pages

All routes are generated at build time because `astro.config.ts` specifies `output: 'static'`. Initial page content, card data, dossier prose, tags, and links are server-rendered into static HTML; they do not depend on JavaScript to exist.

### Shared layout

`BaseLayout.astro` owns:

- Document metadata and title.
- The Astro `ClientRouter` used for view transitions.
- Skip navigation and persistent header.
- Category selection and URL synchronization.
- The global preview modal controller.
- The decorative canvas background.

Pages should use `BaseLayout` unless there is a compelling reason to create another layout. The header filter expects a `#project-grid` on the home page; it safely does nothing on pages without one.

### Components

| Component | Responsibility |
| --- | --- |
| `ProjectCard` | Registry-card media, metadata, and dossier navigation. |
| `RegistryPlate` | Deterministic SVG fallback visual keyed by accession ID. |
| `StatusStamp` | Consistent status indicator. |
| `ArtifactLink` | Artifact visibility and optional external URL presentation. |
| `PreviewModal` | Global sandboxed iframe overlay for live project previews. |
| `SessionStatus` | Home-page status panel synchronized with filtering. |
| `DynamicBackground` | Decorative canvas particle effect, respecting reduced motion. |

### Visual fallback chain

`ProjectCard` and dossier pages render project media in this order:

1. An explicit `thumbnail` from the content record.
2. A Microlink-generated screenshot when the project has `liveUrl` but no thumbnail.
3. A `RegistryPlate` if no screenshot is requested or its image request errors.

This is a progressive enhancement chain. Do not make the fallback inaccessible by placing it above a healthy image; the current implementation places it underneath and reveals it when the image fails.

## Browser-side enhancement

The application uses inline TypeScript-capable browser scripts, not a client framework.

### Category filtering

The header selection reads `?category=` on page load. On `/`, it sets the `hidden` property of cards based on their `data-category`; it also updates the browser URL without a full navigation. On non-home routes, changing the selection navigates to the filtered home page.

The home page maintains the visible-record count and session-status text after filtering. It listens to `astro:page-load` because the Astro client router reuses the document across transitions.

### Preview modal

Dossier buttons with `data-preview-url` open the global modal. The controller loads the URL in a sandboxed iframe, moves focus to its close button, locks page scrolling, closes on Escape or backdrop click, clears the iframe source on close, and restores prior focus.

An iframe is inherently best effort. Target sites can deny embedding with headers such as `X-Frame-Options` or CSP `frame-ancestors`; the external link is the reliable path.

### Motion and lifecycle

`ClientRouter` swaps pages without a full reload. Any behavior that attaches events must be idempotent and re-run on `astro:page-load`. Avoid accumulating duplicate document listeners. Canvas animation is cancelled before a swap and honors `prefers-reduced-motion` by rendering without updating particle positions.

## Styling and accessibility

The site uses global CSS tokens plus component-scoped styles. There is no Tailwind or CSS-in-JS layer.

- Treat CSS custom properties in `src/styles/tokens*.css` as the stable visual API.
- Prefer existing spacing, typography, duration, easing, color, and radius tokens over raw values.
- Keep focus states visible and at least as discoverable as hover states.
- Preserve the skip link, meaningful image alt text, semantic headings, and `aria-live` use where interaction changes status text.
- New decorative effects must use `aria-hidden="true"` and must not intercept pointer events.
- Honor `prefers-reduced-motion` for new persistent motion.

## Deployment and operations

### Build pipeline

```text
git push / pull request
        |
        v
GitHub Actions: npm ci -> npm run check -> npm run build -> link validation
        |
        v
Vercel: install -> npm run build -> serve dist/
```

CI is defined in `.github/workflows/ci.yml`, uses Node 20, and uploads `dist/` for seven days. Vercel uses static output from Astro; no API routes or runtime secrets are part of the architecture.

A monthly **Maintenance** workflow (`.github/workflows/maintenance.yml`, also manually dispatchable) reruns check/build/link validation and generates a staleness report from `lastVerified` and per-record `reviewCadence`. The report is advisory: overdue records warn but do not fail the run.

### Production access

Vercel deployment protection is an account/project setting outside this repository. The intended production visibility must be explicitly verified after configuration changes. For a public portfolio, test in an unauthenticated browser; a CLI bypass token proves a deployment exists but does not prove ordinary visitors can see it.

### External dependencies

| Dependency | Failure mode | Existing mitigation |
| --- | --- | --- |
| Microlink screenshots | Rate limits, outage, target-page failure | Registry plate fallback after image error |
| Live project URLs | Site moved, paused, or protected | Records can omit link; routine verification is required |
| iframe previews | Target disallows framing | “Open Live Project” link remains available |
| Vercel | Access protection or project scope mismatch | Verify production alias and access after deploy |

### Local thumbnail capture

`scripts/capture-thumbnails.mjs` uses Playwright Chromium to visit every content record with a `liveUrl` at a 1600 × 1000 viewport and write `public/images/projects/<slug>.webp`. It waits for DOM content, gives the page a short settling period, disables animations, and writes a machine-readable capture report. It is deliberately best effort: failed targets do not prevent other records from being captured, but the process exits non-zero to make failures visible.

The script adds a schema-valid thumbnail block only after it has written an image. It does not overwrite images by default; pass `--force` to refresh them. Captures require human visual review before commit because a technically successful screenshot can still contain a banner, loading state, or sensitive material.

## Change guide

### Add an accession

1. Select the next unused `PRJ-xxx` identifier.
2. Add `src/content/projects/<stable-slug>.md` with schema-valid frontmatter and body copy.
3. Verify every URL and set `lastVerified` to the actual verification date.
4. Prefer a local thumbnail; otherwise confirm the fallback plate remains appropriate.
5. Run checks and the static build.

### Change a category or status vocabulary

This is a cross-cutting change. Update the tuple in `schemas/project.ts`, display labels in `lib/registry.ts`, the header dropdown in `BaseLayout.astro`, relevant documentation, and every content record affected. Then build the entire site.

### Change a slug

Avoid this for published pages. Rename the Markdown file only after planning redirects and updating any internal `related` references or external links.

### Add client-side interaction

Prefer progressive enhancement. Ensure the static page remains understandable without JavaScript, bind behavior safely across `astro:page-load`, protect focus behavior, and test with keyboard plus reduced motion.

## Known hardening opportunities

These are intentional next steps, not hidden requirements of the current codebase:

- Commit local thumbnails for all records and remove Microlink from the critical visual path.
- Add collection-level validation for unique accession IDs and valid related-slug references.
- Add browser tests for filtering, modal focus handling, dossier navigation, and responsive layouts.
- Enable and review production availability/performance monitoring.
