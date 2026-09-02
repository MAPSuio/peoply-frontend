import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Mascot from "../components/Mascot";

function renderMascot(seed: string) {
  const { container } = render(<Mascot seed={seed} />);
  const svg = container.querySelector("svg");
  if (!svg) throw new Error("Mascot rendered no svg");
  return svg;
}

describe("Mascot", () => {
  it("is decorative, so a screen reader reads the surrounding label instead", () => {
    const svg = renderMascot("user-1");

    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("focusable")).toBe("false");
  });

  it("draws the same markup for the same person", () => {
    expect(renderMascot("user-1").outerHTML).toBe(
      renderMascot("user-1").outerHTML,
    );
  });

  it("draws different markup for different people", () => {
    expect(renderMascot("user-1").outerHTML).not.toBe(
      renderMascot("user-2").outerHTML,
    );
  });

  it("hyphenated svg attributes survive React, so the shading is not dropped", () => {
    expect(renderMascot("user-1").innerHTML).toContain("fill-opacity");
  });

  it("fetches nothing, so it works offline and costs no request", () => {
    const svg = renderMascot("user-1");

    expect(svg.querySelector("image")).toBeNull();
    expect(svg.outerHTML).not.toContain("http");
  });
});
