import { test, expect } from '@playwright/test';

test('Admin can login and view Admin Portal button', async ({ page }) => {
  // 1. Go to the live website
  await page.goto('/');

  // Wait for the site to load (expect some basic elements)
  await expect(page.getByText('NEW ARRIVALS').first()).toBeVisible({ timeout: 10000 });

  // 2. Click the Account/Login icon in the header
  await page.getByLabel('Account').click();

  // 3. Ensure the Auth modal is open and in "Sign In" mode
  // The label says "Email address *"
  await page.locator('input[name="email"]').fill('amogelangmoya2006@gmail.com');
  await page.locator('input[name="password"]').fill('Amogelang@13');

  // 4. Click the submit button (it says "Sign In")
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // 5. Verify successful login by checking for the "Admin Portal" button in the header or mobile menu
  // On desktop it's in a specific div. Wait for the AuthModal to close or Admin button to appear
  const adminPortalBtn = page.getByText('Admin Portal').first();
  await expect(adminPortalBtn).toBeVisible({ timeout: 10000 });
});
