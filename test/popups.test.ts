import { describe, expect, it } from "vitest";
import {
  formatPopupRange,
  fromDateTimeLocal,
  getDefaultInterval,
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

describe("getDefaultInterval", () => {
  it("starts a new popup in the past so it is active on save", () => {
    /* The regression: rounding the start up to the next quarter-hour meant a
       popup created "today" was not active yet, so it landed under Kommende
       and /popups/active still answered "nothing scheduled". */
    const now = new Date("2026-08-15T12:47:30.000Z");
    const { startsAt, endsAt } = getDefaultInterval(now);

    expect(fromDateTimeLocal(startsAt) <= now.toISOString()).toBe(true);
    expect(new Date(fromDateTimeLocal(endsAt)).getTime()).toBeGreaterThan(
      now.getTime(),
    );
  });

  it("spans an hour", () => {
    const now = new Date("2026-08-15T12:00:00.000Z");
    const { startsAt, endsAt } = getDefaultInterval(now);

    expect(
      new Date(fromDateTimeLocal(endsAt)).getTime() -
        new Date(fromDateTimeLocal(startsAt)).getTime(),
    ).toBe(60 * 60 * 1000);
  });
});
