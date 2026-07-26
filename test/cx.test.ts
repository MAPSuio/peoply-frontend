import { describe, expect, it } from "vitest";

import cx from "../utils/cx";

describe("cx", () => {
  it("joins class names with spaces", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy entries", () => {
    expect(cx("a", false, undefined, null, "b")).toBe("a b");
  });

  it("supports conditional classes", () => {
    const active = false;
    expect(cx("base", active && "active")).toBe("base");
  });

  it("returns an empty string with no truthy entries", () => {
    expect(cx(false, undefined)).toBe("");
  });
});
