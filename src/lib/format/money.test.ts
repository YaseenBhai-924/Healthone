import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("formatMoney", () => {
  it("formats cents as AUD", () => {
    expect(formatMoney(4500, "AUD")).toMatch(/\$45\.00/);
  });

  it("handles zero", () => {
    expect(formatMoney(0, "AUD")).toMatch(/\$0\.00/);
  });
});
