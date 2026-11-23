import { describe, expect, it } from "vitest";
import { getAuthEnvConfig } from "./config";

const valid = {
  AUTH_SECRET: "x".repeat(32),
  ENTRA_TENANT_ID: "11111111-1111-1111-1111-111111111111",
  ENTRA_CLIENT_ID: "22222222-2222-2222-2222-222222222222",
  ENTRA_CLIENT_SECRET: "secret",
  API_SCOPE: "api://33333333-3333-3333-3333-333333333333/Requests.Access",
  API_BASE_URL: "http://localhost:5101",
  SITE_URL: "http://localhost:3000",
};

describe("getAuthEnvConfig", () => {
  it("accepts valid config", () => {
    expect(getAuthEnvConfig(valid).AUTH_SECRET).toHaveLength(32);
  });

  it("rejects short AUTH_SECRET and names the key", () => {
    expect(() =>
      getAuthEnvConfig({ ...valid, AUTH_SECRET: "too-short" }),
    ).toThrow(/AUTH_SECRET/);
  });

  it("rejects empty ENTRA_CLIENT_SECRET", () => {
    expect(() =>
      getAuthEnvConfig({ ...valid, ENTRA_CLIENT_SECRET: "" }),
    ).toThrow(/ENTRA_CLIENT_SECRET/);
  });
});
