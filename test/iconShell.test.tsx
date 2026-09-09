import { render } from "@testing-library/react";
import { type ComponentType, createElement } from "react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import SmallCheckIcon from "../components/svgs/SmallCheckIcon";

const SVG_DIRECTORY = join(process.cwd(), "components/svgs");

const PAINTING_SHAPES = "path, circle, ellipse, line, polyline, polygon, rect";

const WRAPS_AN_ICON_RATHER_THAN_BEING_ONE = [
  "Icon.tsx",
  "FoodCircle.tsx",
  "WaitlistIcon.tsx",
];

function iconShellFiles() {
  return readdirSync(SVG_DIRECTORY)
    .filter((file) => file.endsWith(".tsx"))
    .filter((file) => !WRAPS_AN_ICON_RATHER_THAN_BEING_ONE.includes(file));
}

function sourceOf(file: string) {
  return readFileSync(join(SVG_DIRECTORY, file), "utf8");
}

describe("icon shell", () => {
  it("is what every icon opens with, so none hand-rolls a root svg", () => {
    const handRolled = iconShellFiles().filter((file) => {
      const source = sourceOf(file);
      const rootElement = source.search(/<(svg|Icon)\b/);
      if (rootElement === -1) return true;
      return !source.startsWith("<Icon", rootElement);
    });

    expect(handRolled).toEqual([]);
  });

  it("is what every icon renders through", () => {
    const bypassing = iconShellFiles().filter(
      (file) => !sourceOf(file).includes("<Icon"),
    );

    expect(bypassing).toEqual([]);
  });

  it("gives every icon a viewBox, so none renders at a size the caller cannot control", async () => {
    const iconModules = import.meta.glob("../components/svgs/*.tsx") as Record<
      string,
      () => Promise<{ default: ComponentType }>
    >;
    const rendered = iconShellFiles().map(
      (file) => `../components/svgs/${file}`,
    );

    expect(rendered.every((path) => path in iconModules)).toBe(true);

    const withoutViewBox: string[] = [];
    for (const path of rendered) {
      const { default: IconComponent } = await iconModules[path]();
      const { container } = render(createElement(IconComponent));
      if (!container.querySelector("svg")?.getAttribute("viewBox")) {
        withoutViewBox.push(path);
      }
    }

    expect(withoutViewBox).toEqual([]);
  });

  it("leaves every icon with a shape to paint, so none migrated to an empty svg", async () => {
    const iconModules = import.meta.glob("../components/svgs/*.tsx") as Record<
      string,
      () => Promise<{ default: ComponentType }>
    >;

    const withoutShapes: string[] = [];
    for (const file of iconShellFiles()) {
      const { default: IconComponent } =
        await iconModules[`../components/svgs/${file}`]();
      const { container } = render(createElement(IconComponent));
      if (!container.querySelector(PAINTING_SHAPES)) withoutShapes.push(file);
    }

    expect(withoutShapes).toEqual([]);
  });

  it("never lets an icon resolve to no paint at all, which renders invisibly", async () => {
    const iconModules = import.meta.glob("../components/svgs/*.tsx") as Record<
      string,
      () => Promise<{ default: ComponentType }>
    >;

    const invisible: string[] = [];
    for (const file of iconShellFiles()) {
      const { default: IconComponent } =
        await iconModules[`../components/svgs/${file}`]();
      const { container } = render(createElement(IconComponent));
      const shapes = Array.from(container.querySelectorAll(PAINTING_SHAPES));
      const paintsNothing = shapes.some((shape) => {
        const inherited = (name: string) =>
          shape.getAttribute(name) ??
          shape.closest(`[${name}]`)?.getAttribute(name);
        return inherited("fill") === "none" && inherited("stroke") === "none";
      });
      if (paintsNothing) invisible.push(file);
    }

    expect(invisible).toEqual([]);
  });

  it("keeps an icon's own default when a caller passes undefined over it", () => {
    const { container } = render(<SmallCheckIcon strokeWidth={undefined} />);

    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "2");
  });

  it("still lets a caller override that default", () => {
    const { container } = render(<SmallCheckIcon strokeWidth="3" />);

    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "3");
  });
});
