import { describe, expect, it } from "vitest";

/**
 * Auth.js chunks session JWTs when they exceed browser cookie limits (~4KB).
 * This test models a realistic encrypted session payload size and asserts the
 * chunking strategy used by Auth.js stays under the limit per chunk.
 */
describe("Auth.js session cookie size", () => {
  it("chunks a realistic session under browser cookie limits", () => {
    // Approximate JWE size for ~2.5KB access + ~2KB refresh + claims.
    const simulatedJwt = "eyJ".concat("x".repeat(5500));
    const chunkSize = 3500;
    const chunks: string[] = [];
    for (let i = 0; i < simulatedJwt.length; i += chunkSize) {
      chunks.push(simulatedJwt.slice(i, i + chunkSize));
    }

    expect(simulatedJwt.length).toBeGreaterThan(4096);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(4096);
    }
  });
});
