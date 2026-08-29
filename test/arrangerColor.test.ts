import { describe, expect, it } from "vitest";

import {
  arrangerAccentVariable,
  arrangerBackgroundVariable,
  getArrangerColor,
  toArrangerColor,
  toArrangerColorKey,
} from "../utils/arrangerColor";

describe("toArrangerColor", () => {
  it("washes the event in the organization's own color", () => {
    const { background } = toArrangerColor(
      { primary: "#fd7b03", accent: null },
      "org-1",
    );

    expect(background).toBe("#fd7b0329");
  });

  it("uses the second color of the logo as the accent", () => {
    const { accent } = toArrangerColor(
      { primary: "#0051f1", accent: "#e62239" },
      "org-1",
    );

    expect(accent).toBe("#e62239");
  });

  it("keeps the hue when it has to lift a color into the readable band", () => {
    const { accent } = toArrangerColor(
      { primary: "#e62239", accent: "#0ca3b1" },
      "org-1",
    );

    expect(accent).toBe("hsl(185 87% 40%)");
  });

  it("falls back to the dominant color when the logo holds a single hue", () => {
    const { accent } = toArrangerColor(
      { primary: "#0051f1", accent: null },
      "org-1",
    );

    expect(accent).toBe("#0051f1");
  });

  it("lifts an accent that would disappear against a dark theme", () => {
    const { accent } = toArrangerColor(
      { primary: "#050b14", accent: null },
      "org-1",
    );

    expect(accent).not.toBe("#050b14");
    expect(accent).toMatch(/^hsl\(/);
  });

  it("darkens an accent that would disappear against a light theme", () => {
    const { accent } = toArrangerColor(
      { primary: "#fbfdff", accent: null },
      "org-1",
    );

    expect(accent).not.toBe("#fbfdff");
    expect(accent).toMatch(/^hsl\(/);
  });

  it("leaves a color alone when it already reads on both themes", () => {
    expect(
      toArrangerColor({ primary: "#0051f1", accent: "#e62239" }, "org-1")
        .accent,
    ).toBe("#e62239");
  });
});

describe("toArrangerColor with a color it cannot read", () => {
  it("falls back rather than emitting a broken shorthand hex", () => {
    expect(toArrangerColor({ primary: "#fff", accent: null }, "org-1")).toEqual(
      getArrangerColor("org-1"),
    );
  });

  it("falls back on a hex that carries its own alpha", () => {
    expect(
      toArrangerColor({ primary: "#fd7b0380", accent: null }, "org-1"),
    ).toEqual(getArrangerColor("org-1"));
  });

  it("falls back on something that is not a color at all", () => {
    expect(
      toArrangerColor({ primary: "rgb(1,2,3)", accent: null }, "org-1"),
    ).toEqual(getArrangerColor("org-1"));
  });

  it("keeps the dominant color when only the accent is unreadable", () => {
    const { background } = toArrangerColor(
      { primary: "#fd7b03", accent: "nope" },
      "org-1",
    );

    expect(background).toBe("#fd7b0329");
  });
});

describe("getArrangerColor", () => {
  it("writes the fallback wash as a real hsl color with alpha", () => {
    expect(getArrangerColor("org-1").background).toMatch(
      /^hsl\(\d+ \d+% \d+% \/ \d+%\)$/,
    );
  });

  it("gives the same organization the same color every time", () => {
    expect(getArrangerColor("org-1")).toEqual(getArrangerColor("org-1"));
  });

  it("keeps two organizations apart", () => {
    expect(getArrangerColor("org-1")).not.toEqual(getArrangerColor("org-2"));
  });
});

describe("toArrangerColorKey", () => {
  it("survives being spliced into a custom property name", () => {
    const key = toArrangerColorKey("org:1/2 3");

    expect(arrangerAccentVariable(key)).toMatch(/^--arranger-accent-[\w-]+$/);
    expect(arrangerBackgroundVariable(key)).toMatch(/^--arranger-wash-[\w-]+$/);
  });

  it("keeps two organizations on separate custom properties", () => {
    expect(toArrangerColorKey("org-a")).not.toBe(toArrangerColorKey("org.a"));
  });
});
