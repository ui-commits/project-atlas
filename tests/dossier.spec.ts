import { expect } from '@playwright/test';
import { test } from '@playwright/test';

test.describe('dossier navigation', () => {
  test('card title link opens the matching dossier', async ({ page }) => {
    await page.goto('/');

    const slug = 'xxrun';
    const card = page.locator(`.project-card[data-slug="${slug}"]`);
    const title = (await card.locator('.card-title-link').innerText()).trim();

    await card.locator('.card-title-link').click();

    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/?$`));
    await expect(page).toHaveTitle(new RegExp(`${title} — Project Atlas`));
    await expect(page.locator('.dossier-title')).toHaveText(title);
    await expect(page.locator('.dossier-id')).toContainText('PRJ-');
  });

  test('card media link also navigates to the dossier', async ({ page }) => {
    await page.goto('/');

    const slug = 'agentos';
    await page.locator(`.project-card[data-slug="${slug}"] .card-media`).click();

    await expect(page).toHaveURL(new RegExp(`/projects/${slug}/?$`));
    await expect(page.locator('.dossier-title')).toBeVisible();
  });

  test('breadcrumb returns to the registry', async ({ page }) => {
    await page.goto('/projects/xxrun/');

    await expect(page.locator('.dossier-title')).toBeVisible();
    await page.locator('.back-link').click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#project-grid')).toBeVisible();
    await expect(page.locator('.project-card:not([hidden])')).toHaveCount(19);
  });
});
