import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and displays hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText('Finance Hub')).toBeVisible();
  });

  test('has working Start for free CTA', async ({ page }) => {
    await page.goto('/');
    const cta = page.getByRole('link', { name: /start for free/i }).first();
    await expect(cta).toBeVisible();
    await cta.click();
    await expect(page).toHaveURL(/register/);
  });

  test('displays stats section', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Countries supported')).toBeVisible();
  });

  test('features section is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('MPC Security')).toBeVisible();
  });
});
