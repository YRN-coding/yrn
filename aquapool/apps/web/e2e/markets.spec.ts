import { test, expect } from '@playwright/test';

test.describe('Markets page', () => {
  test('loads without error', async ({ page }) => {
    await page.goto('/markets');
    await expect(page).not.toHaveTitle(/error|not found/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('does not show internal server error', async ({ page }) => {
    await page.goto('/markets');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
