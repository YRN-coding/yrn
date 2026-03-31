import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('register page loads with email input', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
  });

  test('signin page loads', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.locator('body')).toBeVisible();
  });

  test('register page does not show server errors on load', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
    await expect(page.locator('body')).not.toContainText('500');
  });
});
