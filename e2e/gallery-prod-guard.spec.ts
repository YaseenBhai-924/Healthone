import { test, expect } from '@playwright/test'

/**
 * Runs against `next start` (production) with COMPONENT_GALLERY_ENABLED unset.
 * Expects /dev/components to 404.
 */
test('gallery returns 404 when flag is off in production', async ({ page }) => {
  const response = await page.goto('/dev/components')
  expect(response?.status()).toBe(404)
})
