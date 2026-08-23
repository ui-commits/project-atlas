import { expect } from '@playwright/test';
import { test } from '@playwright/test';

const TOTAL_RECORDS = 19;

test.describe('home registry', () => {
  test('loads and shows all accessions', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Project Atlas/);
    const cards = page.locator('.project-card');
    await expect(cards).toHaveCount(TOTAL_RECORDS);
    await expect(page.locator('.project-card:not([hidden])')).toHaveCount(TOTAL_RECORDS);
    await expect(page.locator('#active-count')).toHaveText(`[${TOTAL_RECORDS} records]`);
  });
});
