import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Increase workers for better parallelization (use 50% of CPU cores, or 1 in CI)
  workers: process.env.CI ? 1 : '50%',
  timeout: 60000, // 60 seconds per test
  expect: {
    timeout: 8000, // Reduced from 10s - HAR files make responses faster
  },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://practice.expandtesting.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Reduced timeouts - HAR files make responses instant
    actionTimeout: 10000, // Reduced from 15s
    navigationTimeout: 20000, // Reduced from 30s
    // Optimize for speed
    ignoreHTTPSErrors: false,
    // Disable unnecessary features for speed
    javaScriptEnabled: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
