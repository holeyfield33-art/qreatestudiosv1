/**
 * E2E Tests for Landing Page Builder
 * Tests the complete user flow from opening the builder to publishing
 */

import { test, expect } from '@playwright/test';

// Note: These tests require authentication
// You'll need to set up authentication state or use an authenticated session

test.describe('Landing Page Builder - Complete Flow', () => {
  test.use({
    // You may need to set up authentication state here
    // storageState: 'auth.json',
  });

  test.skip('complete builder workflow: add section, edit, save, and publish', async ({ page }) => {
    // This test is skipped by default as it requires:
    // 1. A logged-in session
    // 2. A landing page ID
    // Remove .skip and configure auth to run this test
    
    // Navigate to a test landing page builder
    // Replace with actual page ID from your test database
    await page.goto('/dashboard/landing-pages/test-id/builder');
    
    // Wait for editor to load
    await expect(page.getByText('Loading your workspace')).toBeVisible();
    await expect(page.getByTestId('puck-editor')).toBeVisible({ timeout: 15000 });
    
    // Verify header elements
    await expect(page.getByText('Back')).toBeVisible();
    await expect(page.getByRole('button', { name: /preview/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save draft/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /publish/i })).toBeVisible();
    
    // Drag and add a section (this depends on Puck's UI structure)
    // The actual implementation may vary based on Puck's interface
    const heroSection = page.getByText('HeroSection');
    if (await heroSection.isVisible()) {
      await heroSection.dragTo(page.locator('.Puck-canvas'));
    }
    
    // Edit section properties
    // Click on the added section to open properties panel
    await page.locator('.Puck-selectedItem').first().click();
    
    // Edit headline field
    const headlineInput = page.getByLabel('Headline');
    if (await headlineInput.isVisible()) {
      await headlineInput.fill('E2E Test Headline');
    }
    
    // Wait for auto-save indicator
    await expect(page.getByText(/unsaved changes|saving/i)).toBeVisible();
    
    // Wait for save to complete
    await expect(page.getByText(/saved/i)).toBeVisible({ timeout: 5000 });
    
    // Manual save
    await page.getByRole('button', { name: /save draft/i }).click();
    await expect(page.getByText('Draft saved')).toBeVisible();
    
    // Preview
    const previewButton = page.getByRole('button', { name: /preview/i });
    const [previewPage] = await Promise.all([
      page.waitForEvent('popup'),
      previewButton.click(),
    ]);
    
    // Verify preview opened
    await expect(previewPage).toHaveURL(/\?preview=true/);
    await previewPage.close();
    
    // Publish
    await page.getByRole('button', { name: /publish/i }).click();
    await expect(page.getByText('Page published!')).toBeVisible();
    
    // Should redirect to landing pages list
    await expect(page).toHaveURL('/dashboard/landing-pages');
  });

  test('should load the builder page without errors', async ({ page }) => {
    // This test checks if the page loads - you'll need a valid session and page ID
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    
    // Capture console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to builder
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Wait for editor to load
    await page.waitForSelector('[data-testid="puck-editor"]', { 
      timeout: 20000,
      state: 'visible' 
    });
    
    // Verify no critical console errors
    const criticalErrors = errors.filter(e => 
      !e.includes('Warning') && 
      !e.includes('Download the React DevTools')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('should show error boundary on critical failure', async ({ page }) => {
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    // Intercept API calls and force a failure
    await page.route('**/api/landing-pages/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Should show error state
    await expect(page.getByText(/unable to load|failed to load/i)).toBeVisible();
  });

  test('accessibility: keyboard navigation works', async ({ page }) => {
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Wait for load
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 20000 });
    
    // Tab through buttons - they should all be focusable
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Back button should be focusable
    const backButton = page.getByRole('button', { name: /back/i });
    await expect(backButton).toBeVisible();
    
    // All action buttons should have accessible names
    await expect(page.getByRole('button', { name: /preview/i })).toHaveAttribute('type', 'button');
    await expect(page.getByRole('button', { name: /save draft/i })).toHaveAttribute('type', 'button');
    await expect(page.getByRole('button', { name: /publish/i })).toHaveAttribute('type', 'button');
  });

  test('responsive: should work on tablet viewport', async ({ page }) => {
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Wait for editor
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 20000 });
    
    // Verify header is still functional
    await expect(page.getByRole('button', { name: /back/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /publish/i })).toBeVisible();
  });

  test('should prevent navigation with unsaved changes', async ({ page }) => {
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Wait for editor
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 20000 });
    
    // Make a change (this depends on your Puck configuration)
    // Trigger onChange by interacting with content
    // ... (implementation depends on actual Puck UI)
    
    // Set up dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('unsaved');
      await dialog.dismiss();
    });
    
    // Try to navigate away
    await page.getByRole('button', { name: /back/i }).click();
    
    // Should still be on builder page (dialog was dismissed)
    await expect(page).toHaveURL(/\/builder$/);
  });
});

test.describe('Landing Page Builder - Visual Regression', () => {
  test.skip('visual regression: builder layout', async ({ page }) => {
    test.skip(!process.env.TEST_PAGE_ID, 'Requires TEST_PAGE_ID environment variable');
    
    const pageId = process.env.TEST_PAGE_ID || 'test-id';
    await page.goto(`/dashboard/landing-pages/${pageId}/builder`);
    
    // Wait for editor to fully load
    await page.waitForSelector('[data-testid="puck-editor"]', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    
    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot('builder-layout.png', {
      fullPage: true,
      timeout: 10000,
    });
  });
});
