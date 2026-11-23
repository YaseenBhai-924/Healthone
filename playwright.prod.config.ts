import { defineConfig, devices } from '@playwright/test'

/**
 * Production guard: requires an existing `pnpm build`.
 * Starts `next start` without COMPONENT_GALLERY_ENABLED and asserts 404.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  testMatch: ['**/gallery-prod-guard.spec.ts'],

  use: {
    baseURL: 'http://127.0.0.1:3001',
    ...devices['Desktop Chrome'],
  },

  webServer: {
    // App uses output: 'standalone' — start the standalone server, not `next start`.
    command:
      'node .next/standalone/server.js',
    url: 'http://127.0.0.1:3001/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3001',
      HOSTNAME: '127.0.0.1',
      COMPONENT_GALLERY_ENABLED: '',
    },
  },
})
