import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ApiIcon from "../components/svgs/ApiIcon";

describe("ApiIcon", () => {
  it("leaves its stroke on the root so a stylesheet can recolour it", () => {
    const { container } = render(<ApiIcon />);
    const svg = container.querySelector("svg");
    const strokedPaths = container.querySelectorAll("path[stroke]");

    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    expect(strokedPaths).toHaveLength(0);
  });
});
