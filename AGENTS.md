# AGENTS.md

## Purpose

These instructions apply to all automated coding agents and contributors working in Project Atlas. Keep the site static, content-led, accessible, and easy to verify. Favor small, reviewable changes over broad redesigns.

## First steps

1. Read `README.md` and `ARCHITECTURE.md` before editing.
2. Inspect `git status` and preserve unrelated work in progress.
3. Read the relevant route, component, schema, and content record before changing behavior.
4. Do not alter deployment/account configuration, Vercel access settings, or external projects unless the task explicitly asks for it.

## Commands

```bash
npm ci
npm run dev
npm run check
npm run build
npm run preview
```

Run `npm run check` and `npm run build` for every code or content change. Use `npm run preview` for visual changes or route/content changes that need production-build confirmation.

## Repository rules

- Astro static output is the required deployment model. Do not add a server adapter, API route, database, or authentication dependency without explicit approval.
- Use Astro components and plain CSS custom properties. Do not introduce React, Vue, Tailwind, or a client-state framework for ordinary UI work.
- Preserve `ClientRouter` lifecycle behavior. Browser enhancements must be safe when initialized again after `astro:page-load`.
- Preserve progressive enhancement: content and primary links must work without JavaScript.
- Keep dependencies minimal. Prefer platform and Astro capabilities over new packages.
- Do not commit credentials, Vercel tokens, deployment-protection bypass tokens, `.env` files, or local `.vercel` state.
- Do not invent URLs, repositories, project claims, or verification dates.
- Do not rewrite or discard unrelated changes in the worktree.

## Content changes

Project records live in `src/content/projects/*.md`. The filename is the public slug.

- Validate all frontmatter against `src/schemas/project.ts`.
- Assign the next unused `PRJ-xxx` value. IDs are permanent; never reuse an archived ID.
- Set `lastVerified` only to the date that a human actually checked the record.
- Use only confirmed, complete URLs. Omit unknown or private URLs instead of creating a dead action.
- Keep `summary` concise for card display and put richer details in the Markdown body.
- Use accurate, non-redundant thumbnail alt text. Decorative fallback plates are already hidden from assistive technology.
- When changing a slug, search for internal references and plan a redirect before publishing.
- Use the existing issue template for routine broken-link or record updates.

## UI and accessibility rules

- Start with existing components, styles, and design tokens; extend them before making a new pattern.
- Retain semantic landmarks, heading order, the skip link, visible keyboard focus, and meaningful accessible names.
- Match hover behavior with `:focus-visible` behavior for interactive controls.
- Avoid color-only status communication; status text or accessible labels must remain available.
- Respect `prefers-reduced-motion`. New animated/decorative elements must be nonessential and `aria-hidden` when appropriate.
- Test at a narrow mobile width and a desktop width after layout changes.
- The iframe preview can be blocked by third-party sites. Never remove the direct external-link path.

## Media rules

- Prefer local, committed thumbnails with explicit `width` and `height`.
- The current remote screenshot integration is fallback-only and may fail or be rate-limited.
- Preserve the `RegistryPlate` fallback when changing card or dossier media rendering.
- Do not add unlicensed images or expose private screenshots/URLs.

## Cross-cutting changes

When changing any category, status, availability, or artifact vocabulary, update all affected surfaces:

1. `src/schemas/project.ts`
2. `src/lib/registry.ts`
3. `src/layouts/BaseLayout.astro` if the header filter is affected
4. Content records
5. README and architecture documentation
6. Verification output from `npm run check` and `npm run build`

## Verification checklist

Before handing off a change, complete the applicable checks:

- [ ] `npm run check` passes.
- [ ] `npm run build` passes.
- [ ] New/changed content validates and uses a unique accession ID.
- [ ] Internal routes and changed external URLs have been checked.
- [ ] Home filtering still updates cards, record count, empty state, and URL correctly.
- [ ] Dossier navigation and direct live/source links still work.
- [ ] Keyboard focus, Escape/backdrop modal close, and focus return are preserved when modal code changes.
- [ ] Desktop and mobile visual review is complete for layout changes.
- [ ] Motion changes honor reduced-motion preferences.
- [ ] Documentation is updated if architecture, commands, deployment, schema, or workflow changed.

## Git and release hygiene

- Keep commits focused and use conventional, descriptive messages such as `docs: add architecture guide` or `feat: add PRJ-020 accession`.
- Do not commit generated `dist/`, dependency folders, or local tool artifacts unless repository policy changes explicitly.
- Do not push, open pull requests, deploy, or modify hosting settings unless explicitly requested.
- For a requested production release, confirm CI, build locally, deploy through the authorized Vercel scope, then verify the public alias as an ordinary visitor.
