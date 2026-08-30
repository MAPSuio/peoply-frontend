import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import { getArrangerColor, toArrangerColorKey } from "../utils/arrangerColor";
import {
  ROLLING_WINDOW_IN_WEEKS,
  rollingCalendarRange,
  toArrangerColorsByKey,
  toCalendarEvents,
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

  it("closes about half a year ahead", () => {
    const { end } = rollingCalendarRange(new Date(2026, 7, 29));

    expect(end).toEqual(new Date(2027, 1, 20));
  });

  it("rolls the year over at the end of December", () => {
    const { start, end } = rollingCalendarRange(new Date(2026, 11, 31));

    expect(start).toEqual(new Date(2026, 11, 31));
    expect(end).toEqual(new Date(2027, 5, 24));
  });

  it("spans a whole number of windows, so the last page is a full grid", () => {
    const { start, end } = rollingCalendarRange(new Date(2026, 7, 29));
    const dayInMilliseconds = 24 * 60 * 60 * 1000;
    const windowInDays = ROLLING_WINDOW_IN_WEEKS * 7;

    expect(
      Math.round((end.getTime() - start.getTime()) / dayInMilliseconds) %
        windowInDays,
    ).toBe(0);
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
