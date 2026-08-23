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

  test('header actions show a visible focus indicator when keyboard-focused', async ({
    page,
  }) => {
    await page.goto('/');
    // Tab sequence: skip link -> C. Rodriguez -> GitHub icon
    await page.keyboard.press('Tab'); // skip
    await page.keyboard.press('Tab'); // C. Rodriguez
    await page.keyboard.press('Tab'); // GitHub
    const githubLink = page.locator('.header-icon-btn').first();
    await expect(githubLink).toBeFocused();

    await expect
      .poll(() => githubLink.evaluate((el) => getComputedStyle(el).outlineColor), {
        timeout: 2_000,
        message: 'keyboard focus must produce visible outline',
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
