import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const screenshotsDir = join(__dirname, '..', 'screenshots');

async function captureScreenshots() {
  console.log('🚀 Starting screenshot capture...');
  
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  try {
    // 1. Landing Page
    console.log('📸 Capturing landing page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '01-landing-page.png'),
      fullPage: true,
    });

    // 2. Signup Page
    console.log('📸 Capturing signup page...');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '02-signup-page.png'),
      fullPage: true,
    });

    // 3. Login Page
    console.log('📸 Capturing login page...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '03-login-page.png'),
      fullPage: true,
    });

    // 4. Create a test user and capture authenticated views
    console.log('📸 Creating test user...');
    await page.goto('http://localhost:3000/signup');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 5. Onboarding Page
    console.log('📸 Capturing onboarding page...');
    await page.waitForURL('**/onboarding', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '04-onboarding-page.png'),
      fullPage: true,
    });

    // Fill in username
    await page.fill('input[name="username"]', 'testuser');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 6. My Card Page
    console.log('📸 Capturing my card page...');
    await page.waitForURL('**/my-card', { timeout: 5000 }).catch(() => {
      // If redirect doesn't happen, navigate manually
      return page.goto('http://localhost:3000/my-card');
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(screenshotsDir, '05-my-card-page.png'),
      fullPage: true,
    });

    // 7. 404 Page
    console.log('📸 Capturing 404 page...');
    await page.goto('http://localhost:3000/non-existent-page', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '06-404-page.png'),
      fullPage: true,
    });

    console.log('✅ All screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

