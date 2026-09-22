import { test, expect } from '@playwright/test';

test.describe('Footer Newsletter Subscribe Flow', () => {
  
  test('User can subscribe to the newsletter from the footer', async ({ page }) => {
    // 1. Visit the local dev server
    await page.goto('');
    
    // 2. Scroll down to the footer
    await page.locator('.NewsletterForm').scrollIntoViewIfNeeded();

    // 3. Fill in the email input
    const emailInput = page.locator('.NewsletterInput');
    await emailInput.fill('playwright-test@example.com');
    
    // 4. Click the Subscribe button
    const subscribeBtn = page.locator('.NewsletterBtn');
    await subscribeBtn.click();
    
    // 5. Verify the success toast appears!
    const toast = page.locator('.Toast--success');
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // 6. Verify the toast text
    await expect(toast).toContainText('Successfully subscribed to newsletter!');
    
    // 7. Verify the input clears
    await expect(emailInput).toHaveValue('');
  });
});
