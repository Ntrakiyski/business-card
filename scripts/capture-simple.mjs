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
    const pages = [
      { url: 'http://localhost:3000', name: '01-landing-page.png', title: 'Landing Page' },
      { url: 'http://localhost:3000/signup', name: '02-signup-page.png', title: 'Signup Page' },
      { url: 'http://localhost:3000/login', name: '03-login-page.png', title: 'Login Page' },
      { url: 'http://localhost:3000/non-existent', name: '04-404-page.png', title: '404 Page' },
    ];

    for (const pageInfo of pages) {
      console.log(`📸 Capturing ${pageInfo.title}...`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: join(screenshotsDir, pageInfo.name),
        fullPage: true,
      });
    }

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

