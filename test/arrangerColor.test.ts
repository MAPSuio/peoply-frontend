import { describe, expect, it } from "vitest";

import {
  getArrangerColor,
  toArrangerColorKey,
  getPaletteFromPixels,
  hueDistance,
  toHsl,
} from "../utils/arrangerColor";

const TRANSPARENT = [0, 0, 0, 0];

const MIN_LIGHTNESS_SEPARATION = 0.1;

function pixelsOf(...colors: number[][]) {
  return Uint8ClampedArray.from(colors.flat());
}

function repeat(color: number[], times: number) {
  return Array.from({ length: times }, () => color);
}

describe("getArrangerColor", () => {
  it("gives the same key the same colors every time", () => {
    expect(getArrangerColor("org-1")).toEqual(getArrangerColor("org-1"));
  });

  it("gives different keys different colors", () => {
    expect(getArrangerColor("org-1")).not.toEqual(getArrangerColor("org-2"));
  });
});

describe("getPaletteFromPixels", () => {
  it("returns nothing when every pixel is transparent", () => {
    expect(getPaletteFromPixels(pixelsOf(...repeat(TRANSPARENT, 8)))).toBe(
      undefined,
    );
  });

  it("reads the two most common colors, most common first", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(
        ...repeat([200, 30, 30, 255], 10),
        ...repeat([30, 60, 200, 255], 6),
        ...repeat([30, 200, 60, 255], 2),
      ),
    );

    expect(toHsl(palette?.primary ?? "").hue).toBeCloseTo(0, -1);
    expect(toHsl(palette?.secondary ?? "").hue).toBeCloseTo(228, -1);
  });

  it("returns identical colors for identical pixels, whatever the order they arrive in", () => {
    const first = getPaletteFromPixels(
      pixelsOf(
        ...repeat([200, 30, 30, 255], 4),
        ...repeat([30, 60, 200, 255], 3),
      ),
    );
    const second = getPaletteFromPixels(
      pixelsOf(
        ...repeat([30, 60, 200, 255], 3),
        ...repeat([200, 30, 30, 255], 4),
      ),
    );

    expect(first).toEqual(second);
  });

  it("ignores the white backdrop a logo is drawn on", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(
        ...repeat([255, 255, 255, 255], 40),
        ...repeat([20, 120, 200, 255], 6),
      ),
    );

    expect(toHsl(palette?.primary ?? "").hue).toBeCloseTo(207, -1);
  });

  it("lifts a near-black color into a range that stays visible on both themes", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(...repeat([8, 10, 40, 255], 12)),
    );
    const { lightness, saturation } = toHsl(palette?.primary ?? "");

    expect(lightness).toBeGreaterThanOrEqual(0.4);
    expect(lightness).toBeLessThanOrEqual(0.62);
    expect(saturation).toBeGreaterThanOrEqual(0.35);
  });

  it("keeps a one-color logo honest by varying lightness rather than inventing a hue", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(...repeat([20, 120, 200, 255], 12)),
    );
    const primary = toHsl(palette?.primary ?? "");
    const secondary = toHsl(palette?.secondary ?? "");

    expect(hueDistance(primary.hue, secondary.hue)).toBeLessThan(1);
    expect(Math.abs(secondary.lightness - primary.lightness)).toBeGreaterThan(
      MIN_LIGHTNESS_SEPARATION,
    );
  });

  it("keeps the two colors apart when a one-color logo is already at its lightest readable", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(...repeat([180, 210, 255, 255], 12)),
    );
    const primary = toHsl(palette?.primary ?? "");
    const secondary = toHsl(palette?.secondary ?? "");

    expect(Math.abs(secondary.lightness - primary.lightness)).toBeGreaterThan(
      0.1,
    );
    expect(secondary.lightness).toBeGreaterThanOrEqual(0.4);
    expect(secondary.lightness).toBeLessThanOrEqual(0.62);
  });

  it("keeps the two colors apart when a one-color logo sits mid-band, where neither shift fits", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(...repeat([128, 64, 191, 255], 12)),
    );
    const primary = toHsl(palette?.primary ?? "");
    const secondary = toHsl(palette?.secondary ?? "");

    expect(primary.lightness).toBeCloseTo(0.5, 2);
    expect(Math.abs(secondary.lightness - primary.lightness)).toBeGreaterThan(
      MIN_LIGHTNESS_SEPARATION,
    );
    expect(secondary.lightness).toBeGreaterThanOrEqual(0.4);
    expect(secondary.lightness).toBeLessThanOrEqual(0.62);
  });

  it("skips transparent pixels rather than counting them as black", () => {
    const palette = getPaletteFromPixels(
      pixelsOf(
        ...repeat(TRANSPARENT, 40),
        ...repeat([200, 30, 30, 255], 4),
        ...repeat([30, 60, 200, 255], 3),
      ),
    );

    expect(toHsl(palette?.primary ?? "").hue).toBeCloseTo(0, -1);
  });
});

describe("toArrangerColorKey", () => {
  it("leaves an id that is already safe in a custom property alone", () => {
    expect(toArrangerColorKey("c997beea620f")).toBe("c997beea620f");
  });

  it("gives ids that differ only in punctuation different keys", () => {
    expect(toArrangerColorKey("org_a")).not.toBe(toArrangerColorKey("org a"));
  });

  it("cannot be spoofed by an id that spells out an escape sequence", () => {
    expect(toArrangerColorKey("org-32-a")).not.toBe(
      toArrangerColorKey("org a"),
    );
  });
});

describe("hueDistance", () => {
  it("measures the short way around the wheel", () => {
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(10, 350)).toBe(20);
  });
});
