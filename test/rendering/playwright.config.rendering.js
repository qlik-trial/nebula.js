import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['dot'],
    ['html', { outputFolder: './reports/html' }],
    ['junit', { outputFile: './test/rendering/reports/xml/report.xml' }],
  ],
  testDir: './',
  forbidOnly: !!process.env.CI,
  timeout: 60000,
  expect: {
    toMatchSnapshot: { threshold: 0.00025 },
    timeout: 30000,
  },
  workers: 1,
  use: {
    browserName: 'chromium',
    actionTimeout: 30000,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
