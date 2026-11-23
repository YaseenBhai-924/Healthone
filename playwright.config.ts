import { defineConfig, devices } from '@playwright/test'

/** Dev server: gallery available via NODE_ENV=development. */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  testIgnore: ['**/gallery-prod-guard.spec.ts'],

  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },

  webServer: {
    command: 'pnpm exec next dev --port 3000',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
  },
})
