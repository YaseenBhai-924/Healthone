import { describe, expect, it } from "vitest";
import {
  displayRequestStatus,
  parseQueueFilter,
  statusActionLabel,
} from "./request-labels";

describe("parseQueueFilter", () => {
  it("maps New chip key to Submitted", () => {
    expect(parseQueueFilter("Submitted")).toBe("Submitted");
  });

  it("treats all as null", () => {
    expect(parseQueueFilter("all")).toBeNull();
    expect(parseQueueFilter(null)).toBeNull();
  });
});

describe("displayRequestStatus", () => {
  it("uses fulfilment-aware Ready labels", () => {
    expect(displayRequestStatus("ReadyOrDispatched", "Delivery")).toBe(
      "Dispatched",
    );
    expect(displayRequestStatus("ReadyOrDispatched", "Collection")).toBe(
      "Ready for collection",
    );
  });
});

describe("statusActionLabel", () => {
  it("labels ready action by fulfilment", () => {
    expect(statusActionLabel("ReadyOrDispatched", "Delivery")).toBe(
      "Mark dispatched",
    );
    expect(statusActionLabel("ReadyOrDispatched", "Collection")).toBe(
      "Mark ready for collection",
    );
  });
});
