import { describe, expect, it } from "vitest";
import {
  formatPopupRange,
  fromDateTimeLocal,
  toDateTimeLocal,
} from "../utils/popups";

describe("popup date utilities", () => {
  it("round-trips local date picker values without shifting the instant", () => {
    const instant = new Date("2026-08-15T12:30:00.000Z");
    expect(fromDateTimeLocal(toDateTimeLocal(instant))).toBe(
      instant.toISOString(),
    );
  });

  it("formats same-month ranges compactly", () => {
    expect(
      formatPopupRange("2026-08-17T10:00:00.000Z", "2026-08-19T14:00:00.000Z"),
    ).toBe("17.–19. aug. 2026");
  });
});
