/**
 * Project Atlas — Astro configuration.
 * Static output for Vercel deployment. No vercel.json or server adapter required;
 * Astro static builds deploy to Vercel without additional configuration.
 */

import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://project-atlas.vercel.app',
});
