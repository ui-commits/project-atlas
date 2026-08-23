import { expect } from '@playwright/test';
import { test } from '@playwright/test';

/**
 * Preview modal focus handling.
 *
 * Tests run against a dossier for a project that has a liveUrl (the modal
 * trigger is only rendered then). The embedded site itself is blocked so
 * the suite stays hermetic — we are testing the controller, not the target.
 */

const DOSSIER = '/projects/xxrun/';
const LIVE_URL = 'https://xxrun.vercel.app';
const MODAL = '#preview-modal';

function trigger(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: /Preview .* in modal/i });
}

async function openModal(page: import('@playwright/test').Page) {
  await page.goto(DOSSIER);
  await page.route(`${LIVE_URL}/**`, route => route.abort());
  await trigger(page).click();
}

/** Active element's class list, read in-page. */
const activeClass = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.activeElement?.className ?? '');

test.describe('preview modal', () => {
  test('opening moves focus to the close button and locks page scroll', async ({ page }) => {
    await openModal(page);

    await expect(page.locator(MODAL)).toHaveAttribute('aria-hidden', 'false');
    await expect
      .poll(() => activeClass(page), { timeout: 2_000, message: 'close button must receive focus' })
      .toContain('preview-modal-close');
    await expect(page.locator('#preview-iframe')).toHaveAttribute('src', LIVE_URL);
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .toBe('hidden');
  });

  test('Escape closes the modal, restores focus, and unlocks scroll', async ({ page }) => {
    await openModal(page);

    await page.keyboard.press('Escape');

    await expect(page.locator(MODAL)).toHaveAttribute('aria-hidden', 'true');
    await expect
      .poll(() => activeClass(page), { timeout: 2_000, message: 'focus must return to the trigger' })
      .toContain('action-preview');
    await expect(page.locator('#preview-iframe')).toHaveAttribute('src', 'about:blank');
    await expect
      .poll(() => page.evaluate(() => document.body.style.overflow))
      .not.toBe('hidden');
  });

  test('backdrop click closes the modal and restores focus', async ({ page }) => {
    await openModal(page);

    // Click the backdrop edge, clear of the dialog container.
    await page.locator('.preview-modal-backdrop').click({ position: { x: 8, y: 8 } });

    await expect(page.locator(MODAL)).toHaveAttribute('aria-hidden', 'true');
    await expect
      .poll(() => activeClass(page), { timeout: 2_000, message: 'focus must return to the trigger' })
      .toContain('action-preview');
    await expect(page.locator('#preview-iframe')).toHaveAttribute('src', 'about:blank');
  });
});
