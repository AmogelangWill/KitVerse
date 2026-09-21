import { test, expect } from '@playwright/test';

test('Admin can view the new analytics dashboard cards', async ({ page }) => {
  // 1. Go to the live website
  await page.goto('/');

  // 2. Login
  await page.getByLabel('Account').click();
  await page.locator('input[name="email"]').fill('amogelangmoya2006@gmail.com');
  await page.locator('input[name="password"]').fill('Amogelang@13');
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();

  // 3. Navigate to Admin Portal
  const adminPortalBtn = page.getByText('Admin Portal').first();
  await expect(adminPortalBtn).toBeVisible({ timeout: 10000 });
  await adminPortalBtn.click();

  // 4. Verify the new Analytics Cards we just built!
  await expect(page.getByText('Avg Monthly Users')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Avg Monthly Sales')).toBeVisible({ timeout: 10000 });
});
