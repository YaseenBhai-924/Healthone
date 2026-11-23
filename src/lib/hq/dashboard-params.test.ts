import { describe, expect, it } from "vitest";
import {
  buildDashboardQuery,
  chartTitle,
  formatPeriodLabel,
  granularityLabel,
  parseDateOnly,
  parseGranularity,
  parsePharmacyId,
  statusLabel,
} from "./dashboard-params";

describe("dashboard-params", () => {
  it("parses granularity with Day default", () => {
    expect(parseGranularity("Week")).toBe("Week");
    expect(parseGranularity("Month")).toBe("Month");
    expect(parseGranularity("nope")).toBe("Day");
    expect(parseGranularity(undefined)).toBe("Day");
  });

  it("accepts only yyyy-MM-dd dates", () => {
    expect(parseDateOnly("2026-10-01")).toBe("2026-10-01");
    expect(parseDateOnly("01/10/2026")).toBeUndefined();
    expect(parseDateOnly("")).toBeUndefined();
  });

  it("accepts only UUID pharmacy ids", () => {
    expect(parsePharmacyId("11111111-1111-1111-1111-111111111111")).toBe(
      "11111111-1111-1111-1111-111111111111",
    );
    expect(parsePharmacyId("not-a-guid")).toBeUndefined();
  });

  it("builds query strings for dashboard APIs", () => {
    expect(buildDashboardQuery({})).toBe("");
    expect(
      buildDashboardQuery({
        from: "2026-10-01",
        to: "2026-10-15",
        pharmacyId: "11111111-1111-1111-1111-111111111111",
        granularity: "Week",
      }),
    ).toBe(
      "?from=2026-10-01&to=2026-10-15&pharmacyId=11111111-1111-1111-1111-111111111111&granularity=Week",
    );
  });

  it("labels periods and statuses for display", () => {
    expect(granularityLabel("Day")).toBe("Daily");
    expect(chartTitle("Month")).toBe("Gross amount by month");
    expect(statusLabel("Submitted")).toBe("New");
    expect(formatPeriodLabel("2026-10-01", "Month")).toMatch(/2026/);
    expect(formatPeriodLabel("2026-10-06", "Week")).toMatch(/Week of/);
  });
});
