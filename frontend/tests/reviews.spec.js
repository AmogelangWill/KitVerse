import { test, expect } from '@playwright/test';

test.describe('Product Reviews Flow', () => {
  
  test('User can open reviews drawer and see auth prompt if logged out', async ({ page }) => {
    // 1. Visit a product page (assuming ID 3 exists)
    await page.goto('http://localhost:5173/product/3');
    
    // Wait for loading to finish
    await page.waitForSelector('.PDP-Title', { timeout: 10000 });

    // 2. Click the 'Read X reviews' link
    const reviewsLink = page.locator('span', { hasText: /Read \d+ review/i });
    await reviewsLink.click();
    
    // 3. Verify the drawer opens
    const drawer = page.locator('.ReviewsDrawer');
    await expect(drawer).toHaveClass(/open/);
    
    // 4. Verify auth prompt is visible
    const authPrompt = page.locator('.SignInPrompt');
    await expect(authPrompt).toBeVisible();
    await expect(authPrompt).toContainText('Please sign in to write a review.');
  });
});
