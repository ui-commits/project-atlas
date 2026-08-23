/**
 * @module lib/registry
 * @description Registry utilities, display mappings, and cross-record validation
 * for Project Atlas.
 */

import type { ProjectCategory, ProjectStatus, ProjectAvailability } from '../schemas/project';

/* ------------------------------------------------------------------ */
/*  Display Mappings                                                   */
/* ------------------------------------------------------------------ */

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'ui-systems': 'UI Systems & Theme Kits',
  'runtime-systems': 'Runtime & Systems Visualization',
  'agents-automation': 'Agents & Automation',
  'tools-analysis': 'Tools & Analysis',
  'developer-tools': 'Developer Tools',
  'creative-experiments': 'Creative Tools & Experiments',
  'personal-context': 'Portfolio & Personal Context',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: 'LIVE',
  'in-progress': 'IN PROGRESS',
  local: 'LOCAL',
  archive: 'ARCHIVE',
};

export const AVAILABILITY_LABELS: Record<ProjectAvailability, string> = {
  public: 'Public',
  private: 'Private',
  pending: 'Pending',
};

/* ------------------------------------------------------------------ */
/*  Procedural SVG Contour / Seed Generator for Registry Plates        */
/* ------------------------------------------------------------------ */

/**
 * Generates a deterministic integer seed from a registry ID string (e.g. 'PRJ-001').
 */
export function getSeedFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates deterministic SVG contour paths for the registry plate fallback.
 * Uses the registryId to seed line parameters (frequency, curvature, offset).
 */
export function generateContourPaths(registryId: string, width = 480, height = 300): string[] {
  const seed = getSeedFromId(registryId);
  const paths: string[] = [];
  const lineCount = 5;

  for (let i = 0; i < lineCount; i++) {
    const lineSeed = (seed + i * 97) % 1000;
    const yStart = (height / (lineCount + 1)) * (i + 1) + ((lineSeed % 30) - 15);
    const cp1x = width * 0.25;
    const cp1y = yStart + ((lineSeed % 60) - 30);
    const cp2x = width * 0.75;
    const cp2y = yStart - (((lineSeed * 3) % 60) - 30);
    const yEnd = yStart + (((lineSeed * 7) % 40) - 20);

    paths.push(`M 0 ${yStart.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${width} ${yEnd.toFixed(1)}`);
  }

  return paths;
}
