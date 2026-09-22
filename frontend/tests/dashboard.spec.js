import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Reports & Metrics', () => {
  // Use the admin credentials provided by the user
  const adminEmail = 'amogelangmoya2006@gmail.com';
  const adminPassword = 'Amogelang@13';

  test('Dashboard loads the Sales Chart, Filters, and required Rubric Metrics', async ({ page }) => {
    // 1. Visit the homepage and open Auth Modal
    await page.goto('/');
    
    // Click the account icon/button in the header to open AuthModal
    await page.click('button[aria-label="Account"]');
    
    // Fill in the login form
    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.click('.AuthSubmitBtn');

    // Wait for the modal to close and the user to be logged in
    await page.waitForTimeout(5000); // Give it enough time for Railway to log us in

    // Now go to admin dashboard
    await page.goto('/admin');
    
    // Wait for the Admin Dashboard Overview to load
    await expect(page.locator('h1', { hasText: 'Overview' })).toBeVisible({ timeout: 15000 });

    // 2. Verify the required rubric metric cards are present
    const usersPerDay = page.locator('.DashboardCardTitle', { hasText: 'Avg Users/Day' });
    const productsSold = page.locator('.DashboardCardTitle', { hasText: 'Products Sold' });
    const stockOnHand = page.locator('.DashboardCardTitle', { hasText: 'Stock On Hand' });

    await expect(usersPerDay).toBeVisible();
    await expect(productsSold).toBeVisible();
    await expect(stockOnHand).toBeVisible();

    // 3. Verify the Sales Over Time chart container exists
    await expect(page.locator('h2', { hasText: 'Sales Over Time' })).toBeVisible();
    
    // 4. Verify the filtering dropdown exists (3, 6, 12, 24 months)
    const filterSelect = page.locator('select');
    await expect(filterSelect).toBeVisible();
    await filterSelect.selectOption('6');
    
    // 5. Verify the Recharts container renders SVG paths
    const chartSvg = page.locator('.recharts-surface');
    await expect(chartSvg).toBeVisible();
  });
});
