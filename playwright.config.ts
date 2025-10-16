import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Mobile Screenshots',
      use: { 
        ...devices['iPhone 12'],
        viewport: { width: 370, height: 667 },
        // Use chromium instead of webkit for better compatibility
        channel: undefined,
        browserName: 'chromium',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
    // Wait for server to be fully ready
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
