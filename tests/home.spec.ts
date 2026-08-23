import { expect, type Page } from '@playwright/test';
import { test } from '@playwright/test';

const TOTAL_RECORDS = 19;

/** Read the per-category card counts currently rendered on the home page. */
async function categoryCounts(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const counts: Record<string, number> = {};
    for (const el of document.querySelectorAll('[data-category]')) {
      const category = el.getAttribute('data-category') ?? '';
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  });
}

test.describe('home registry', () => {
  test('loads and shows all accessions', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Project Atlas/);
    const cards = page.locator('.project-card');
    await expect(cards).toHaveCount(TOTAL_RECORDS);
    await expect(page.locator('.project-card:not([hidden])')).toHaveCount(TOTAL_RECORDS);

    await expect(page.locator('#active-count')).toHaveText(`[${TOTAL_RECORDS} records]`);
  });

  test('category filter updates visible cards, counters, and URL', async ({
    page,
  }) => {
    await page.goto('/');
    const counts = await categoryCounts(page);
    const category = 'ui-systems';
    const expected = counts[category];

    test.skip(!expected, `no records in "${category}" to exercise the filter`);

    await page.locator('#header-category-filter').selectOption(category);

    // The app syncs its counters on a short debounce (30ms).
    const expectedLabel =
      expected === 1 ? `[${expected} record]` : `[${expected} records]`;
    await expect(page.locator('#active-count')).toHaveText(expectedLabel);
    await expect(page.locator('.project-card:not([hidden])')).toHaveCount(expected);
    await expect(page.locator(`.project-card[data-category="${category}"]:not([hidden])`)).toHaveCount(
      expected,
    );

    // Filter state is URL-backed without a navigation.
    await expect(page).toHaveURL(new RegExp(`/\\?category=${category}$`));
  });

  test('resetting the filter restores all records and clears the URL param', async ({ page }) => {
    await page.goto('/');
    await page.locator('#header-category-filter').selectOption('runtime-systems');
    await expect(page.locator('#active-count')).not.toHaveText(`[${TOTAL_RECORDS} records]`);

    await page.locator('#header-category-filter').selectOption('all');

    await expect(page.locator('.project-card:not([hidden])')).toHaveCount(TOTAL_RECORDS);
    await expect(page.locator('#active-count')).toHaveText(`[${TOTAL_RECORDS} records]`);
    await expect(page).toHaveURL(/\/$/);
  });

  test('deep link with ?category= pre-filters on load', async ({ page }) => {
    await page.goto('/?category=agents-automation');
    const counts = await categoryCounts(page);
    const expected = counts['agents-automation'] ?? 0;

    const select = page.locator('#header-category-filter');
    await expect(select).toHaveValue('agents-automation');
    if (expected > 0) {
      await expect(page.locator('.project-card:not([hidden])')).toHaveCount(expected);
    } else {
      await expect(page.locator('#empty-state')).toBeVisible();
    }
  });
});
