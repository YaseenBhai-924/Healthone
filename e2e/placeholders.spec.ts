import { expect, test } from "@playwright/test";

/** Matches middleware.ts security headers (HSTS is Front Door, not app). */
const expectedHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "no-referrer",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
  "cache-control": "no-store",
};

for (const path of ["/", "/admin", "/hq"] as const) {
  test(`${path} renders and sends security headers`, async ({ page, request }) => {
    const response = await request.get(path);
    expect(response.status()).toBe(200);

    for (const [name, value] of Object.entries(expectedHeaders)) {
      if (name === "cache-control") {
        expect(response.headers()[name] ?? "").toContain("no-store");
      } else {
        expect(response.headers()[name]).toBe(value);
      }
    }

    const csp = response.headers()["content-security-policy"] ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toMatch(/'nonce-[A-Za-z0-9+/=]+'/);
    expect(csp).toContain("https://js.stripe.com");
    expect(csp).toContain("https://login.microsoftonline.com");
    expect(csp).toContain("frame-ancestors 'none'");

    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
  });
}

test("GET /health returns ok", async ({ request }) => {
  const response = await request.get("/health");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({ status: "ok" });
});
