import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type Event, EventRegistrationMode } from "../types/types";
import { isEventFinished, showsRegistrationCount } from "../utils/event";

/* Local noon, so the "same day" cases are unaffected by the timezone the
   test runs in. */
const now = new Date(2026, 6, 28, 12, 0, 0);

const makeEvent = (startDate: Date, endDate?: Date): Event =>
  ({
    startDate: startDate.toISOString(),
    endDate: endDate ? endDate.toISOString() : null,
  }) as Event;

describe("isEventFinished", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("without an end date", () => {
    it("is not finished when it starts later today", () => {
      expect(isEventFinished(makeEvent(new Date(2026, 6, 28, 20, 0, 0)))).toBe(
        false,
      );
    });

    it("is not finished when it started earlier today", () => {
      expect(isEventFinished(makeEvent(new Date(2026, 6, 28, 8, 0, 0)))).toBe(
        false,
      );
    });

    it("is not finished when it starts on a later day", () => {
      expect(isEventFinished(makeEvent(new Date(2026, 6, 29, 8, 0, 0)))).toBe(
        false,
      );
    });

    it("is finished when its start day has passed", () => {
      expect(isEventFinished(makeEvent(new Date(2026, 6, 27, 20, 0, 0)))).toBe(
        true,
      );
    });
  });

  describe("with an end date", () => {
    it("is not finished when it ends later today", () => {
      expect(
        isEventFinished(
          makeEvent(
            new Date(2026, 6, 28, 8, 0, 0),
            new Date(2026, 6, 28, 18, 0, 0),
          ),
        ),
      ).toBe(false);
    });

    it("is finished once the end date has passed", () => {
      expect(
        isEventFinished(
          makeEvent(
            new Date(2026, 6, 28, 8, 0, 0),
            new Date(2026, 6, 28, 10, 0, 0),
          ),
        ),
      ).toBe(true);
    });
  });
});

describe("showsRegistrationCount", () => {
  it("hides the count for external registration", () => {
    expect(
      showsRegistrationCount({
        registrationMode: EventRegistrationMode.EXTERNAL,
      }),
    ).toBe(false);
  });

  it("shows the count for registration in Peoply", () => {
    expect(
      showsRegistrationCount({
        registrationMode: EventRegistrationMode.PEOPLY,
      }),
    ).toBe(true);
  });

  /* NONE means nobody registers through us either, but the count we hold for
     such an event is still our own - only EXTERNAL is deliberately unknown. */
  it("shows the count when registration is not handled", () => {
    expect(
      showsRegistrationCount({ registrationMode: EventRegistrationMode.NONE }),
    ).toBe(true);
  });

  it("defaults to showing when there is no event yet", () => {
    expect(showsRegistrationCount(undefined)).toBe(true);
  });
});
