import { describe, expect, it } from "vitest";

import definition from "../utils/mascot/pixelbot.json";
import { type MascotElement, getMascot } from "../utils/mascot/mascot";

function flatten(elements: MascotElement[]): MascotElement[] {
  return elements.flatMap((element) => [element, ...flatten(element.children)]);
}

function fills(seed: string) {
  return flatten(getMascot(seed).elements)
    .map((element) => element.attributes.fill)
    .filter((fill): fill is string => fill !== undefined);
}

describe("getMascot", () => {
  it("gives the same person the same mascot every time", () => {
    expect(getMascot("user-1")).toEqual(getMascot("user-1"));
  });

  it("gives different people different mascots", () => {
    const seeds = Array.from({ length: 40 }, (_, index) => `user-${index}`);
    const rendered = new Set(
      seeds.map((seed) => JSON.stringify(getMascot(seed))),
    );

    expect(rendered.size).toBe(seeds.length);
  });

  it("resolves every colour reference, so nothing renders as raw JSON", () => {
    for (const fill of fills("user-1")) {
      expect(fill).toMatch(/^(#[0-9a-f]{3,8}|hsl\(|none$)/i);
    }
  });

  it("gives each person their own glow", () => {
    const glows = new Set(
      ["a", "b", "c", "d", "e"].map(
        (seed) => fills(seed).find((fill) => fill.startsWith("hsl")) ?? "",
      ),
    );

    expect(glows.size).toBeGreaterThan(1);
  });

  it("uses no element ids, so two mascots on one page cannot collide", () => {
    const withIds = flatten(getMascot("user-1").elements).filter(
      (element) => element.attributes.id !== undefined,
    );

    expect(withIds).toEqual([]);
  });
});

describe("the vendored artwork", () => {
  it("stays attributable, so the licence travels with the file", () => {
    expect(definition.$provenance).toMatchObject({
      style: "Pixelbot",
      license: "CC0 1.0",
      creator: "DiceBear",
    });
  });

  it("keeps every component it draws, with variants to choose between", () => {
    for (const component of Object.values(definition.components)) {
      expect(Object.keys(component.variants).length).toBeGreaterThan(0);
    }
  });

  it("ships no animation, which would run on every avatar in a list", () => {
    expect(Object.keys(definition.components)).not.toContain("animation");
    expect(JSON.stringify(definition)).not.toContain('"name":"style"');
  });
});
