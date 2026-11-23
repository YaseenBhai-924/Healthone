import { afterEach, describe, expect, it } from "vitest";
import { portalHome, safeReturnPath } from "./return-url";

describe("portalHome", () => {
  it("maps roles to the correct dashboard", () => {
    expect(portalHome("PharmacyStaff")).toBe("/admin");
    expect(portalHome("SuperAdmin")).toBe("/hq");
  });
});

describe("safeReturnPath", () => {
  const prev = process.env.SITE_URL;

  afterEach(() => {
    process.env.SITE_URL = prev;
  });

  it("returns role homes for null/empty", () => {
    expect(safeReturnPath(null, "PharmacyStaff")).toBe("/admin");
    expect(safeReturnPath("", "SuperAdmin")).toBe("/hq");
    // Pre-auth (unknown role) defaults to pharmacy portal, not /auth/sign-in.
    expect(safeReturnPath(undefined, null)).toBe("/admin");
  });

  it("allows same-role relative paths", () => {
    expect(safeReturnPath("/admin", "PharmacyStaff")).toBe("/admin");
    expect(safeReturnPath("/admin/requests/abc", "PharmacyStaff")).toBe(
      "/admin/requests/abc",
    );
    expect(safeReturnPath("/hq/dashboard", "SuperAdmin")).toBe("/hq/dashboard");
  });

  it("allows /admin and /hq when role is unknown (pre-auth sign-in)", () => {
    expect(safeReturnPath("/admin", null)).toBe("/admin");
    expect(safeReturnPath("/admin/requests/abc", null)).toBe(
      "/admin/requests/abc",
    );
    expect(safeReturnPath("/hq", null)).toBe("/hq");
    expect(safeReturnPath("/hq/dashboard", null)).toBe("/hq/dashboard");
    expect(safeReturnPath("/auth/sign-in", null)).toBe("/admin");
  });

  it("rejects the other role path", () => {
    expect(safeReturnPath("/hq", "PharmacyStaff")).toBe("/admin");
    expect(safeReturnPath("/admin", "SuperAdmin")).toBe("/hq");
  });

  it.each([
    "https://evil.example/admin",
    "//evil.example",
    "/\\evil.example",
    "/%2f%2fevil.example",
    "/admin\\x",
    "javascript:alert(1)",
    "data:text/html,hi",
    "/admin\r\n",
    "/admin%0d%0a",
    "/admin%09",
    "https://user:pass@localhost:3000/admin",
    "a".repeat(3000),
  ])("rejects hostile input %s", (raw) => {
    process.env.SITE_URL = "http://localhost:3000";
    expect(safeReturnPath(raw, "PharmacyStaff")).toBe("/admin");
  });

  it("allows same-origin absolute URL for the right role", () => {
    process.env.SITE_URL = "http://localhost:3000";
    expect(
      safeReturnPath("http://localhost:3000/admin/requests", "PharmacyStaff"),
    ).toBe("/admin/requests");
  });
});
