import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApiIcon from "../components/svgs/ApiIcon";

describe("ApiIcon", () => {
  it("draws the angle-bracket glyph", () => {
    const { container } = render(<ApiIcon />);

    const outlines = Array.from(container.querySelectorAll("path"), (path) =>
      path.getAttribute("d"),
    );

    expect(outlines).toHaveLength(3);
    expect(outlines.every((outline) => outline && outline.length > 0)).toBe(
      true,
    );
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
