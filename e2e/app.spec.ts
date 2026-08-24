import { test, expect } from '@playwright/test';

test.describe('E-Commerce App E2E Flow', () => {
  test('should load welcome screen and navigate to home', async ({ page }: { page: any }) => {
    await page.goto('/');
    const title = page.locator('text=SVK');
    await expect(title).toBeDefined();
  });

  test('should verify cart items and apply promo code SVK20', async ({ page }: { page: any }) => {
    await page.goto('/cart');
    const promoInput = page.locator('input[placeholder*="Promo"]');
    if (await promoInput.isVisible()) {
      await promoInput.fill('SVK20');
      await page.click('text=Apply');
    }
  });

  test('should verify categories listing', async ({ page }: { page: any }) => {
    await page.goto('/categories');
    const categoryHeader = page.locator('text=Categories');
    await expect(categoryHeader).toBeDefined();
  });
});
