import { beforeEach, describe, expect, it } from "vitest";

import {
  getBackgroundPatternEnabled,
  setBackgroundPatternEnabled,
} from "../utils/backgroundPattern";

describe("getBackgroundPatternEnabled", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("is off until the user turns it on", () => {
    expect(getBackgroundPatternEnabled()).toBe(false);
  });

  it("stays off when storage holds an unrecognised value", () => {
    window.localStorage.setItem("backgroundPatternEnabled", "yes");

    expect(getBackgroundPatternEnabled()).toBe(false);
  });

  it("reads back the preference the user saved", () => {
    setBackgroundPatternEnabled(true);
    expect(getBackgroundPatternEnabled()).toBe(true);

    setBackgroundPatternEnabled(false);
    expect(getBackgroundPatternEnabled()).toBe(false);
  });
});
