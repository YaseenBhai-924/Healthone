import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const routes = [
  '/',
  '/order',
  '/contact',
  '/status/lost-link',
  '/privacy',
  '/terms',
] as const

const securityHeaders = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

for (const path of routes) {
  test(`${path} has security headers and Cache-Control no-store`, async ({
    request,
  }) => {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    for (const [name, value] of Object.entries(securityHeaders)) {
      expect(response.headers()[name]).toBe(value)
    }
    const cache = response.headers()['cache-control'] ?? ''
    expect(cache).toContain('no-store')
    const csp = response.headers()['content-security-policy'] ?? ''
    expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=]+'/)
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test(`${path} has no serious axe violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })

  test(`${path} visual smoke 375 and 1280`, async ({ page }) => {
    test.setTimeout(60_000)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1').first()).toBeVisible()
    await page.screenshot({
      path: `test-results/smoke-${path.replace(/\//g, '_') || 'home'}-375.png`,
      fullPage: false,
    })

    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto(path, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('h1').first()).toBeVisible()
    await page.screenshot({
      path: `test-results/smoke-${path.replace(/\//g, '_') || 'home'}-1280.png`,
      fullPage: false,
    })
  })
}

test('header mobile menu: open, focus trap, Escape', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const openBtn = page.getByRole('button', { name: 'Open menu' })
  await openBtn.click()
  const dialog = page.getByRole('dialog', { name: 'Mobile navigation' })
  await expect(dialog).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Close menu' }),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(openBtn).toBeFocused()
})

test('hero preview: tab clicks and pause', async ({ page }) => {
  await page.goto('/')
  const tab = page.getByRole('tab', { name: 'Payment link sent' })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText('Pay securely with Stripe')).toBeVisible()
  const pauseOrResume = page.getByRole('button', {
    name: /Pause preview|Resume preview/,
  })
  await expect(pauseOrResume).toBeVisible()
  await pauseOrResume.click()
  await expect(
    page.getByRole('button', { name: /Pause preview|Resume preview/ }),
  ).toBeVisible()
})

test('hero preview: no autoplay under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Pause preview' })).toHaveCount(0)
  const first = page.getByRole('tab', { name: 'Order submitted' })
  await expect(first).toHaveAttribute('aria-selected', 'true')
  await page.waitForTimeout(4000)
  await expect(first).toHaveAttribute('aria-selected', 'true')
})

test('how it works stepper changes sample screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/#how-it-works')
  const step = page.getByRole('button', {
    name: /Pharmacy verifies, then sends a payment link/i,
  })
  await step.click()
  await expect(
    page.getByTestId('how-it-works-phone').getByText('Payment link emailed'),
  ).toBeVisible()
})

test('delivery toggle swaps panels', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('radiogroup', { name: 'Fulfilment option' })
    .getByText('Home delivery')
    .click()
  await expect(page.getByRole('heading', { name: 'Home delivery' })).toBeVisible()
  await page.getByRole('radiogroup', { name: 'Fulfilment option' })
    .getByText('Click and collect')
    .click()
  await expect(
    page.getByRole('heading', { name: 'Click and collect' }),
  ).toBeVisible()
})

test('order estimate toggle updates totals', async ({ page }) => {
  await page.goto('/order')
  const group = page.getByRole('radiogroup', { name: 'Estimate fulfilment' })
  await group.getByText('Delivery').click()
  await expect(page.getByText('Estimated total')).toBeVisible()
  await group.getByText('Collection').click()
  await expect(page.getByText('Delivery from')).toBeVisible()
})

test('lost-link formats reference, neutral success, cooldown', async ({
  page,
}) => {
  await page.goto('/status/lost-link')
  await page.getByLabel('Reference').fill('sd7k4m2qxp')
  await expect(page.getByLabel('Reference')).toHaveValue('SD-7K4M-2QXP')
  await page.getByLabel('Email').fill('patient@example.com')
  await page.getByRole('button', { name: 'Send link' }).click()
  await expect(
    page.getByText(/If those details match an order/i),
  ).toBeVisible()
  await expect(page.getByText(/You can request again in/i)).toBeVisible()
})

test('contact form validation and copy buttons', async ({ page }) => {
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText(/Enter your name/i).first()).toBeVisible()
  await page.getByRole('textbox', { name: 'Name' }).fill('Alex Patient')
  await page.getByRole('textbox', { name: 'Email' }).fill('alex@example.com')
  await page.getByRole('textbox', { name: 'Message' }).fill(
    'Hello from the contact form test.',
  )
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText(/Thanks, we will reply/i)).toBeVisible()

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy phone' }).click()
  await expect(
    page.getByText(/Phone copied|Copy failed/i).first(),
  ).toBeVisible({ timeout: 5000 })
})

test('legal TOC scroll-spy highlights section', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto('/privacy')
  const toc = page.locator('aside nav.hidden.lg\\:block')
  await expect(toc).toBeVisible()
  const link = toc.locator('a').filter({ hasText: /How we use your information/i })
  await link.click()
  await expect(page).toHaveURL(/#section-3|#.*use/i)
  await expect(page.locator('#legal-prose h2').nth(2)).toBeInViewport()
})
