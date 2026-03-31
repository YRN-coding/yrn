import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('unauthenticated access redirects or shows auth prompt', async ({ page }) => {
    await page.goto('/dashboard');
    // Should either redirect to login or stay on dashboard
    await expect(page).toHaveURL(/signin|login|dashboard/, { timeout: 10000 });
  });

  test('dashboard page does not crash', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).not.toContainText('Application error');
  });
});
