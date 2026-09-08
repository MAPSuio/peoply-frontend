import { render } from "@testing-library/react";
import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";

import Icon from "../components/svgs/Icon";

function renderIcon(props: Partial<ComponentProps<typeof Icon>> = {}) {
  const { container } = render(
    <Icon viewBox="0 0 24 24" {...props}>
      <path d="M0 0h24v24H0z" />
    </Icon>,
  );

  const svg = container.querySelector("svg");
  if (!svg) throw new Error("Icon rendered no svg element");

  return svg;
}

describe("Icon", () => {
  it("sizes itself from the viewBox so an icon never declares the same number three times", () => {
    const svg = renderIcon({ viewBox: "0 0 14 14" });

    expect(svg).toHaveAttribute("viewBox", "0 0 14 14");
    expect(svg).toHaveAttribute("width", "14");
    expect(svg).toHaveAttribute("height", "14");
  });

  it("lets a logo render smaller than its own coordinate system", () => {
    const svg = renderIcon({ viewBox: "0 0 814 1000", width: 24, height: 24 });

    expect(svg).toHaveAttribute("viewBox", "0 0 814 1000");
    expect(svg).toHaveAttribute("width", "24");
    expect(svg).toHaveAttribute("height", "24");
  });

  it("omits width and height when the viewBox is not four numbers", () => {
    const svg = renderIcon({ viewBox: "nonsense" });

    expect(svg).not.toHaveAttribute("width");
    expect(svg).not.toHaveAttribute("height");
  });

  it("passes className through so callers keep styling icons the way they do today", () => {
    const svg = renderIcon({ className: "someClass" });

    expect(svg).toHaveAttribute("class", "someClass");
  });

  it("does not decide fill on the icon's behalf", () => {
    expect(renderIcon()).not.toHaveAttribute("fill");
    expect(renderIcon({ fill: "none" })).toHaveAttribute("fill", "none");
  });

  it("forwards arbitrary svg attributes, including accessibility ones", () => {
    const svg = renderIcon({
      role: "img",
      "aria-label": "MAPS",
      "aria-hidden": "true",
    });

    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-label", "MAPS");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("lets an icon keep a default a caller may pass undefined over", () => {
    const svg = renderIcon({ strokeWidth: undefined });

    expect(svg).not.toHaveAttribute("strokeWidth");
  });

  it("renders its children", () => {
    expect(renderIcon().querySelector("path")).toBeInTheDocument();
  });
});
