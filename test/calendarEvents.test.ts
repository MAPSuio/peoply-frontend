import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import { getArrangerColor, toArrangerColorKey } from "../utils/arrangerColor";
import {
  WINDOWS_IN_HORIZON,
  calendarWindows,
  rollingCalendarRange,
  toArrangerColorsByKey,
  toCalendarEvents,
  windowRangeLabel,
} from "../utils/calendarEvents";

function eventArrangedBy(organization: {
  id: string;
  name: string;
  image?: string;
  imagePrimaryColor?: string | null;
  imageAccentColor?: string | null;
}) {
  return {
    id: `event-${organization.id}`,
    urlId: `event-${organization.id}`,
    title: "Kodekveld",
    startDate: "2026-09-03T16:00:00.000Z",
    eventArrangers: [
      {
        arrangerId: `arranger-${organization.id}`,
        arranger: { id: `arranger-${organization.id}`, organization },
      },
    ],
  } as unknown as Event;
}

const MAPS = {
  id: "org-1",
  name: "MAPS",
  image: "https://blob.test/maps.png",
  imagePrimaryColor: "#fd7b03",
  imageAccentColor: "#0051f1",
};
const MIKRO = { id: "org-2", name: "Mikro" };

describe("rollingCalendarRange", () => {
  it("opens on today, so the days already spent this month are out of range", () => {
    const { start } = rollingCalendarRange(new Date(2026, 7, 29, 13, 45));

    expect(start).toEqual(new Date(2026, 7, 29));
  });

  it("keeps events earlier today in range", () => {
    const { start } = rollingCalendarRange(new Date(2026, 7, 29, 23, 59));

    expect(start.getHours()).toBe(0);
  });

  it("reaches a year ahead, which is where the last window ends", () => {
    const now = new Date(2026, 7, 29);
    const windows = calendarWindows(now, WINDOWS_IN_HORIZON);

    expect(rollingCalendarRange(now).end).toEqual(windows.at(-1)?.end);
  });
});

describe("calendarWindows", () => {
  it("opens on this week rather than the first of the month", () => {
    const saturday = new Date(2026, 7, 29, 13, 45);
    const [firstWindow] = calendarWindows(saturday, 1);

    expect(firstWindow).toEqual({
      start: new Date(2026, 7, 24),
      end: new Date(2026, 8, 28),
    });
  });

  it("starts on Monday even when the week is almost over, so the grid rows line up", () => {
    const sunday = new Date(2026, 7, 30);
    const [firstWindow] = calendarWindows(sunday, 1);

    expect(firstWindow.start).toEqual(new Date(2026, 7, 24));
    expect(firstWindow.start.getDay()).toBe(1);
  });

  it("starts on the day itself when the day is a Monday", () => {
    const monday = new Date(2026, 7, 24, 9, 30);
    const [firstWindow] = calendarWindows(monday, 1);

    expect(firstWindow.start).toEqual(new Date(2026, 7, 24));
  });

  it("leaves no gap between the windows it stacks", () => {
    const windows = calendarWindows(new Date(2026, 7, 29), 3);

    expect(windows).toHaveLength(3);
    expect(windows[1].start).toEqual(windows[0].end);
    expect(windows[2].start).toEqual(windows[1].end);
  });

  it("stops at the horizon however many windows the caller asks for", () => {
    const windows = calendarWindows(
      new Date(2026, 7, 29),
      WINDOWS_IN_HORIZON + 4,
    );

    expect(windows).toHaveLength(WINDOWS_IN_HORIZON);
  });

  it("stacks nothing when asked for fewer than one window", () => {
    expect(calendarWindows(new Date(2026, 7, 29), 0)).toEqual([]);
    expect(calendarWindows(new Date(2026, 7, 29), -2)).toEqual([]);
  });

  it("keeps both ends on midnight across the autumn clock change", () => {
    const [windowOverClockChange] = calendarWindows(new Date(2026, 9, 14), 1);

    expect(windowOverClockChange.start.getHours()).toBe(0);
    expect(windowOverClockChange.end.getHours()).toBe(0);
  });
});

describe("windowRangeLabel", () => {
  it("names the first and last day the window actually shows", () => {
    const [firstWindow] = calendarWindows(new Date(2026, 7, 29), 1);

    expect(windowRangeLabel(firstWindow)).toBe("24. aug.–27. sep.");
  });
});

describe("toArrangerColorsByKey", () => {
  it("colors an arranger from the colors stored with its logo", () => {
    const colors = toArrangerColorsByKey(
      toCalendarEvents([eventArrangedBy(MAPS)]),
    );

    expect(colors[toArrangerColorKey(MAPS.id)]).toEqual({
      accent: "#0051f1",
      background: "#fd7b0329",
    });
  });

  it("lists each arranger once, however many events it has", () => {
    const colors = toArrangerColorsByKey(
      toCalendarEvents([eventArrangedBy(MAPS), eventArrangedBy(MAPS)]),
    );

    expect(Object.keys(colors)).toEqual([toArrangerColorKey(MAPS.id)]);
  });

  it("keeps the stored colors when another event carries the same arranger without them", () => {
    const colors = toArrangerColorsByKey(
      toCalendarEvents([
        eventArrangedBy(MAPS),
        eventArrangedBy({ ...MAPS, imagePrimaryColor: null }),
      ]),
    );

    expect(colors[toArrangerColorKey(MAPS.id)].background).toBe("#fd7b0329");
  });

  it("falls back for an arranger whose id collides with a name on Object.prototype", () => {
    const CONSTRUCTOR = { id: "constructor", name: "Konstruktør" };

    const colors = toArrangerColorsByKey(
      toCalendarEvents([eventArrangedBy(CONSTRUCTOR)]),
    );

    expect(colors[toArrangerColorKey(CONSTRUCTOR.id)]).toEqual(
      getArrangerColor(toArrangerColorKey(CONSTRUCTOR.id)),
    );
  });

  it("falls back to a color derived from the id when the logo had none", () => {
    const colors = toArrangerColorsByKey(
      toCalendarEvents([eventArrangedBy(MIKRO)]),
    );

    expect(colors[toArrangerColorKey(MIKRO.id)]).toEqual(
      getArrangerColor(toArrangerColorKey(MIKRO.id)),
    );
  });
});

describe("toCalendarEvents start time", () => {
  it("carries the start time so a narrow month cell can still show it", () => {
    const [calendarEvent] = toCalendarEvents([eventArrangedBy(MAPS)]);

    expect(calendarEvent.extendedProps.startTime).toBe(
      new Date("2026-09-03T16:00:00.000Z").toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    );
  });

  it("pads the hour so every cell lines up", () => {
    const event = eventArrangedBy(MIKRO);
    event.startDate = "2026-09-03T04:05:00.000Z";

    const [calendarEvent] = toCalendarEvents([event]);

    expect(calendarEvent.extendedProps.startTime).toMatch(/^\d{2}:\d{2}$/);
  });
});
