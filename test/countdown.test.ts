import { describe, expect, it } from "vitest";

import { formatCountdown } from "../utils/countdown";

describe("formatCountdown", () => {
  it("drops the hour segment below an hour", () => {
    expect(formatCountdown(59 * 60 + 5)).toBe("59:05");
  });

  it("keeps hours, minutes and seconds two digits wide above an hour", () => {
    expect(formatCountdown(3600 + 4 * 60 + 9)).toBe("1:04:09");
  });

  it("returns null at zero so the caller can drop the label", () => {
    expect(formatCountdown(0)).toBeNull();
    expect(formatCountdown(-1)).toBeNull();
  });
});
