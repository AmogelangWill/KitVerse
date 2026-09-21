import { test, expect } from '@playwright/test';

test.describe('Forgot and Reset Password Flow', () => {
  
  test('Forgot Password Modal UI and Submission', async ({ page }) => {
    // 1. Visit the local dev server
    await page.goto('http://localhost:5173');
    
    // 2. Open Auth Modal
    await page.click('button[aria-label="Account"]');
    await expect(page.locator('.AuthModal')).toBeVisible();

    // 3. Click "Forgot your password?"
    await page.click('text=Forgot your password?');
    
    // 4. Verify we are in Forgot Password mode
    await expect(page.locator('h2.AuthTitle')).toHaveText('Reset Password');
    await expect(page.locator('text=Enter your email and we\'ll send you a link')).toBeVisible();
    
    // 5. Submit an email
    await page.fill('input[name="email"]', 'test-forgot@example.com');
    await page.click('button.AuthSubmitBtn');
    
    // 6. Verify success message or network response
    // Wait for the success message or error message (since backend might say "user not found" or "link sent")
    const msg = page.locator('.AuthSuccess, .AuthError').first();
    await expect(msg).toBeVisible({ timeout: 10000 });
    const text = await msg.textContent();
    console.log('Forgot Password response:', text);
  });

  test('Reset Password Page UI and Submission', async ({ page }) => {
    // 1. Visit the Reset Password page with a fake token
    await page.goto('http://localhost:5173/reset-password?token=fake-token-123');
    
    // 2. Verify UI loads
    await expect(page.locator('h2.AuthTitle')).toHaveText('Reset Password');
    
    // 3. Fill in passwords
    await page.fill('input[type="password"]', 'NewPass123!');
    // The second input is confirm password
    await page.locator('input[type="password"]').nth(1).fill('NewPass123!');
    
    // 4. Submit
    await page.click('button.AuthSubmitBtn');
    
    // 5. Verify the backend returns an error because the token is fake
    const errorMsg = page.locator('.AuthError');
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
    const text = await errorMsg.textContent();
    console.log('Reset Password backend response with fake token:', text);
  });
});
