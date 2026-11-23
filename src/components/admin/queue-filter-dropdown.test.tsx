import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { QueueFilterDropdown } from "./queue-filter-dropdown";

const counts = {
  Submitted: 6,
  PaymentPending: 1,
  InProgress: 1,
  ReadyOrDispatched: 0,
  Completed: 2,
  Rejected: 1,
};

describe("QueueFilterDropdown", () => {
  it("opens a status menu with counts and preserves search", async () => {
    const user = userEvent.setup();
    render(
      <QueueFilterDropdown
        activeKey="all"
        statusCounts={counts}
        search="SD-9"
      />,
    );

    await user.click(screen.getByRole("button", { name: /all/i }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: /awaiting payment/i }),
    ).toHaveAttribute("href", "/admin?status=PaymentPending&search=SD-9");
    expect(screen.getByRole("option", { name: /^all/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
