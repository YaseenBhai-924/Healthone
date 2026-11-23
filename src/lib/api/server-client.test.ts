import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/auth", () => ({
  getAccessToken: vi.fn(async () => "tok"),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@/lib/config", () => ({
  getServerConfig: () => ({
    API_BASE_URL: "http://localhost:5101",
    SITE_URL: "http://localhost:3000",
    API_SCOPE: "api://00000000-0000-0000-0000-000000000002/Requests.Access",
    ENTRA_TENANT_ID: "00000000-0000-0000-0000-000000000001",
    ENTRA_CLIENT_ID: "00000000-0000-0000-0000-000000000003",
  }),
}));

import { apiFetch } from "./server-client";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("maps 404 to notFound", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 404 })),
    );
    await expect(apiFetch("/api/admin/me")).resolves.toEqual({
      status: "notFound",
    });
  });

  it("maps 403 to forbidden", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 403 })),
    );
    await expect(apiFetch("/api/admin/me")).resolves.toEqual({
      status: "forbidden",
    });
  });

  it("refuses absolute URLs outside API origin", async () => {
    await expect(
      apiFetch("https://evil.example/api/admin/me" as never),
    ).resolves.toMatchObject({ status: "unavailable" });
  });

  it("maps 204 No Content to ok with undefined data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );
    await expect(apiFetch<void>("/api/admin/requests/x/status", { method: "POST" })).resolves.toEqual({
      status: "ok",
      data: undefined,
    });
  });

  it("maps 410 with problem detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ detail: "The eScript token has been removed under the retention policy." }), {
            status: 410,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    await expect(apiFetch("/api/admin/requests/x/token/reveal", { method: "POST" })).resolves.toEqual({
      status: "gone",
      message: "The eScript token has been removed under the retention policy.",
    });
  });
});
