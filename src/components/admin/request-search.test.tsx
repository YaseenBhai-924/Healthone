import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RequestSearch } from "./request-search";

describe("RequestSearch", () => {
  it("allows patient names without forcing uppercase", () => {
    render(<RequestSearch defaultValue="fahad hammed" compact />);

    const input = screen.getByRole("textbox", {
      name: /search by patient name or reference/i,
    });
    expect(input).toHaveValue("fahad hammed");
    expect(input).toHaveAttribute("maxLength", "100");
    expect(input.className).not.toMatch(/\buppercase\b/);
  });
});
