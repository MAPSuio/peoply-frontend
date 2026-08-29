import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import { getArrangerColor, toArrangerColorKey } from "../utils/arrangerColor";
import {
  boundedNavigationRange,
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

describe("boundedNavigationRange", () => {
  it("opens on the first of the month the clock is in, so the current month is a full grid", () => {
    const { start } = boundedNavigationRange(new Date(2026, 7, 29, 13, 45));

    expect(start).toEqual(new Date(2026, 7, 1));
  });

  it("closes one year ahead", () => {
    const { end } = boundedNavigationRange(new Date(2026, 7, 29));

    expect(end).toEqual(new Date(2027, 8, 1));
  });

  it("rolls the year over at the end of December", () => {
    const { start, end } = boundedNavigationRange(new Date(2026, 11, 31));

    expect(start).toEqual(new Date(2026, 11, 1));
    expect(end).toEqual(new Date(2028, 0, 1));
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

  it("falls back to a color derived from the id when the logo had none", () => {
    const colors = toArrangerColorsByKey(
      toCalendarEvents([eventArrangedBy(MIKRO)]),
    );

    expect(colors[toArrangerColorKey(MIKRO.id)]).toEqual(
      getArrangerColor(toArrangerColorKey(MIKRO.id)),
    );
  });
});
