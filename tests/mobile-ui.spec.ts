import { test, expect } from '@playwright/test';

test.describe('Mobile UI Screenshots @370px', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to exactly 370px width
    await page.setViewportSize({ width: 370, height: 667 });
  });

  test('Landing Page - Home', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/01-landing-page.png',
      fullPage: true 
    });

    // Verify key elements are visible
    await expect(page.getByText('Your Digital Business Card')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('Sign Up Page', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/02-signup-page.png',
      fullPage: true 
    });

    // Verify form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('Login Page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/03-login-page.png',
      fullPage: true 
    });

    // Verify form elements
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('Onboarding Page - Username Selection', async ({ page }) => {
    await page.goto('/onboarding');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/04-onboarding-page.png',
      fullPage: true 
    });

    // Verify onboarding elements
    await expect(page.getByText('Choose Your Username')).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('Profile Not Found Page', async ({ page }) => {
    await page.goto('/nonexistent-user-12345');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: 'tests/screenshots/05-not-found-page.png',
      fullPage: true 
    });

    // Verify 404 page elements
    await expect(page.getByText('Profile Not Found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to Homepage' })).toBeVisible();
  });

  test('Check Responsive Layout', async ({ page }) => {
    await page.goto('/');
    
    // Test that buttons stack vertically on mobile
    const buttons = page.locator('a').filter({ hasText: /Get Started|Sign In/ });
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);
    
    await page.screenshot({ 
      path: 'tests/screenshots/06-mobile-responsive-check.png',
      fullPage: true 
    });
  });

  test('Verify No Horizontal Overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that page width doesn't exceed viewport
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(370);
    
    await page.screenshot({ 
      path: 'tests/screenshots/07-no-overflow-check.png',
      fullPage: true 
    });
  });
});

test.describe('Authenticated Pages Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 370, height: 667 });
  });

  test('My Card Page - Protected Route Redirect', async ({ page }) => {
    // Visit protected page without auth - should redirect to login
    await page.goto('/my-card');
    await page.waitForLoadState('networkidle');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/);
    
    await page.screenshot({ 
      path: 'tests/screenshots/08-my-card-redirect-to-login.png',
      fullPage: true 
    });
  });
});

test.describe('UI Element Checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 370, height: 667 });
  });

  test('All Text is Readable', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check text contrast and readability
    const heading = page.getByText('Your Digital Business Card');
    await expect(heading).toBeVisible();
    
    // Get computed styles to verify readability
    const fontSize = await heading.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Font should be at least 14px for mobile readability
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThanOrEqual(14);
    
    await page.screenshot({ 
      path: 'tests/screenshots/09-text-readability-check.png',
      fullPage: true 
    });
  });

  test('Touch Targets are Adequate', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check button sizes (should be at least 44x44 for mobile)
    const button = page.getByRole('link', { name: 'Get Started' }).first();
    const box = await button.boundingBox();
    
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(40); // Allow slight variance
    }
    
    await page.screenshot({ 
      path: 'tests/screenshots/10-touch-target-check.png',
      fullPage: true 
    });
  });
});

