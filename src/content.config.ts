/**
 * @module content.config
 * @description Astro Content Layer configuration for Project Atlas.
 * Defines the 'projects' collection using the glob loader.
 *
 * Each Markdown file in src/content/projects/ becomes a project record.
 * The filename (without extension) serves as the entry ID and URL slug,
 * so slugs are never duplicated in frontmatter.
 */

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { projectSchema } from './schemas/project';

/* ------------------------------------------------------------------ */
/*  Collections                                                        */
/* ------------------------------------------------------------------ */

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: projectSchema,
});

export const collections = { projects };
