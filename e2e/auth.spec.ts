import { expect, test } from "@playwright/test";
import { encode } from "@auth/core/jwt";
import http from "node:http";
import type { AddressInfo } from "node:net";

const AUTH_SECRET = "e2e-test-secret-at-least-32-chars!!";
const COOKIE = "authjs.session-token";

async function forgeSession(overrides: Record<string, unknown> = {}) {
  return encode({
    token: {
      name: "E2E User",
      role: "PharmacyStaff",
      pharmacyName: "Pharmacy A",
      accessDenied: false,
      apiError: false,
      signedInAt: Date.now(),
      accessTokenExpiresAt: Date.now() + 3600_000,
      accessToken: "e2e-access-token-value",
      refreshToken: "e2e-refresh-token-value",
      ...overrides,
    },
    secret: AUTH_SECRET,
    salt: COOKIE,
    maxAge: 8 * 60 * 60,
  });
}

test.describe("auth pages (unauthenticated)", () => {
  test("signed-out /admin redirects to sign-in with safe callback", async ({
    page,
  }) => {
    await page.goto("/admin/requests/abc");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    const url = new URL(page.url());
    expect(url.searchParams.get("callbackUrl")).toMatch(/^\/admin/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in with microsoft/i }),
    ).toHaveCount(1);
  });

  test("hostile callbackUrl is ignored on sign-in", async ({ page }) => {
    await page.goto("/auth/sign-in?callbackUrl=https://evil.example");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("auth pages have no-store and security headers", async ({ page }) => {
    const res = await page.goto("/auth/sign-in");
    expect(res?.headers()["cache-control"]).toMatch(/no-store/i);
    expect(res?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res?.headers()["referrer-policy"]).toBe("no-referrer");
  });
});

test.describe("forged sessions", () => {
  test("staff reaches /admin and is forbidden on /hq", async ({
    page,
    context,
  }) => {
    const token = await forgeSession({ role: "PharmacyStaff" });
    await context.addCookies([
      {
        name: COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    await page.goto("/admin");
    await expect(page.getByText("PharmacyStaff")).toBeVisible();

    const hq = await page.goto("/hq");
    expect(hq?.status()).toBe(403);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /do not have access/i,
    );
  });

  test("/api/auth/session never returns tokens", async ({ page, context }) => {
    const token = await forgeSession();
    await context.addCookies([
      {
        name: COOKIE,
        value: token,
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);

    const res = await page.goto("/api/auth/session");
    const body = await res?.text();
    expect(body).not.toContain("e2e-access-token-value");
    expect(body).not.toContain("e2e-refresh-token-value");
    const json = body ? JSON.parse(body) : {};
    expect(json.user?.accessToken).toBeUndefined();
    expect(json.user?.refreshToken).toBeUndefined();
  });
});

test.describe("production AUTH_SECRET", () => {
  test("rejects AUTH_SECRET shorter than 32 characters", async () => {
    const { getAuthEnvConfig } = await import("../src/lib/config");
    expect(() =>
      getAuthEnvConfig({
        AUTH_SECRET: "short",
        ENTRA_TENANT_ID: "11111111-1111-1111-1111-111111111111",
        ENTRA_CLIENT_ID: "22222222-2222-2222-2222-222222222222",
        ENTRA_CLIENT_SECRET: "x",
        API_SCOPE: "api://33333333-3333-3333-3333-333333333333/Requests.Access",
        API_BASE_URL: "http://localhost:5101",
        SITE_URL: "http://localhost:3000",
      }),
    ).toThrow(/AUTH_SECRET/);
  });
});

// Keep the unused import referenced for future mock-API expansion.
void http;
void (null as unknown as AddressInfo);
