/**
 * @module schemas/project
 * @description Core type definitions and Zod validation schemas for Project Atlas
 * registry records. All project frontmatter is validated against these schemas
 * via Astro Content Collections.
 *
 * Controlled vocabularies are defined as const tuples so they serve as both
 * runtime arrays (for filters, UI) and compile-time literal unions.
 */

import { z } from 'zod';

/* ------------------------------------------------------------------ */
/*  Controlled vocabularies                                            */
/* ------------------------------------------------------------------ */

/** Lifecycle status of a project in the registry. */
export const PROJECT_STATUSES = [
  'live',
  'in-progress',
  'local',
  'archive',
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Public availability — separates access from lifecycle. */
export const PROJECT_AVAILABILITIES = [
  'public',
  'private',
  'pending',
] as const;
export type ProjectAvailability = (typeof PROJECT_AVAILABILITIES)[number];

/** Thematic category for browsing and filtering. */
export const PROJECT_CATEGORIES = [
  'ui-systems',
  'runtime-systems',
  'agents-automation',
  'tools-analysis',
  'developer-tools',
  'creative-experiments',
  'personal-context',
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Supported artifact document types. */
export const ARTIFACT_TYPES = [
  'readme',
  'architecture',
  'design-notes',
  'technical-article',
  'demo',
  'source',
  'screenshots',
  'changelog',
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

/** Visibility of an individual artifact. */
export const ARTIFACT_VISIBILITIES = [
  'public',
  'private',
  'pending',
] as const;
export type ArtifactVisibility = (typeof ARTIFACT_VISIBILITIES)[number];

/* ------------------------------------------------------------------ */
/*  Registry-ID validation                                             */
/* ------------------------------------------------------------------ */

/**
 * Immutable registry accession format: PRJ-001 through PRJ-999.
 * Assigned once on project creation — never reused or reassigned.
 *
 * Cross-document uniqueness is enforced at build time by the registry
 * validation utility (src/lib/registry.ts), not by Zod alone.
 */
export const REGISTRY_ID_PATTERN = /^PRJ-\d{3}$/;

/* ------------------------------------------------------------------ */
/*  Zod schemas                                                        */
/* ------------------------------------------------------------------ */

/**
 * Project thumbnail with explicit dimensions to prevent layout shift.
 * Width and height correspond to the source image's intrinsic size.
 */
export const thumbnailSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

/**
 * A single project artifact (README, architecture doc, demo, etc.).
 * URL is optional: private or pending artifacts must not expose dead links.
 */
export const artifactSchema = z.object({
  label: z.string(),
  type: z.enum(ARTIFACT_TYPES),
  url: z.string().url().optional(),
  description: z.string().optional(),
  visibility: z.enum(ARTIFACT_VISIBILITIES).default('public'),
});

/**
 * Complete frontmatter schema for one project content record.
 * Slug is derived from the Markdown filename — not stored in frontmatter.
 */
export const projectSchema = z.object({
  title: z.string(),
  registryId: z.string().regex(REGISTRY_ID_PATTERN, {
    message: 'registryId must match format PRJ-001 through PRJ-999',
  }),
  category: z.enum(PROJECT_CATEGORIES),
  status: z.enum(PROJECT_STATUSES),
  availability: z.enum(PROJECT_AVAILABILITIES),
  featured: z.boolean().default(false),
  year: z.number().int().min(2020).max(2030),
  summary: z.string(),
  whyItMatters: z.string(),
  liveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  thumbnail: thumbnailSchema.optional(),
  tags: z.array(z.string()).default([]),
  artifacts: z.array(artifactSchema).default([]),
  related: z.array(z.string()).optional(),
});

/* ------------------------------------------------------------------ */
/*  Inferred TypeScript types                                          */
/* ------------------------------------------------------------------ */

/** Validated project record (inferred from Zod schema). */
export type ProjectRecord = z.infer<typeof projectSchema>;

/** Validated artifact record. */
export type ArtifactRecord = z.infer<typeof artifactSchema>;

/** Validated thumbnail record. */
export type ThumbnailRecord = z.infer<typeof thumbnailSchema>;
