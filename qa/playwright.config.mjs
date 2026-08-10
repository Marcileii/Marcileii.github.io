import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /ui\.spec\.mjs/,
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'chromium',
    trace: 'retain-on-failure'
  },
  outputDir: 'test-results'
});
