import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApiIcon from "../components/svgs/ApiIcon";

describe("ApiIcon", () => {
  it("draws the angle-bracket glyph", () => {
    const { container } = render(<ApiIcon />);

    expect(container.querySelectorAll("path")).toHaveLength(3);
  });

  it("takes its colour from whatever renders it", () => {
    const { container } = render(<ApiIcon />);
    const svg = container.querySelector("svg");

    /* The menus colour their icons with a `svg { stroke: … }` rule. A stroke
       on a child beats that inherited value, so the glyph must leave its own
       descendants unpainted. */
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(container.querySelectorAll("svg *[stroke]")).toHaveLength(0);
  });
});
