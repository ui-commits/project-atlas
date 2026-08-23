/**
 * Playwright configuration for Project Atlas.
 *
 * Runs against the production build served by `astro preview`, so a fresh
 * `npm run build` must exist first (the webServer below does not build).
 *
 * NOTE: @playwright/test is intentionally NOT a package.json dependency yet;
 * install ad hoc with `npm i --no-save @playwright/test` until the Phase 2
 * thumbnail work lands and CI wiring is added.
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'tests/playwright-report' }]],

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],

  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
