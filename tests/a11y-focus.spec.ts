import { expect } from '@playwright/test';
import { test } from '@playwright/test';

test.describe('keyboard access and visible focus', () => {
  test('skip link is revealed by keyboard focus and jumps to main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('.skip-link');

    // Parked off-screen until focused (top: -100%).
    const parked = await skipLink.boundingBox();
    expect(parked?.y ?? 0).toBeLessThan(0);

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    const revealed = await skipLink.boundingBox();
    expect(revealed?.y ?? -1).toBeGreaterThanOrEqual(0);

    // Activating it targets #main-content.
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content/);
    await expect(page.locator('#main-content')).toBeInViewport();
  });

  test('the category filter shows a visible focus indicator when keyboard-focused', async ({
    page,
  }) => {
    await page.goto('/');
    const select = page.locator('#header-category-filter');

    // Tab until the filter is reached instead of assuming a fixed order.
    for (let i = 0; i < 10 && !(await select.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press('Tab');
    }
    await expect(select).toBeFocused();

    // The select transitions its focus ring in; poll until it lands.
    // The site's focus token is the mint accent (#6ee7b7).
    await expect
      .poll(() => select.evaluate((el) => getComputedStyle(el).boxShadow), {
        timeout: 2_000,
        message: 'keyboard focus must produce the mint focus ring',
      })
      .toContain('110, 231, 183');
  });

  test('keyboard focus continues into the card grid', async ({ page }) => {
    await page.goto('/');

    let focusedTag = '';
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase() ?? '');
      if (focusedTag === 'a') {
        const inGrid = await page.evaluate(() =>
          Boolean(document.activeElement?.closest('.project-card')),
        );
        if (inGrid) return;
      }
    }
    throw new Error(`keyboard focus never reached a card action (last: ${focusedTag})`);
  });
});
