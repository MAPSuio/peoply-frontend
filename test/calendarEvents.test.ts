import { describe, expect, it } from "vitest";

import type { Event } from "../types/types";
import { toArrangerColorKey } from "../utils/arrangerColor";
import {
  boundedNavigationRange,
  toArrangerImageSources,
  toCalendarEvents,
} from "../utils/calendarEvents";

function eventArrangedBy(organization: {
  id: string;
  name: string;
  image?: string;
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

const MAPS = { id: "org-1", name: "MAPS", image: "https://blob.test/maps.png" };
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

describe("toArrangerImageSources", () => {
  it("lists each arranger once, however many events it has", () => {
    const sources = toArrangerImageSources(
      toCalendarEvents([eventArrangedBy(MAPS), eventArrangedBy(MAPS)]),
    );

    expect(sources).toEqual([
      { key: toArrangerColorKey(MAPS.id), imageUrl: MAPS.image },
    ]);
  });

  it("keeps the picture when another event carries the same arranger without one", () => {
    const sources = toArrangerImageSources(
      toCalendarEvents([
        eventArrangedBy(MAPS),
        eventArrangedBy({ ...MAPS, image: undefined }),
      ]),
    );

    expect(sources).toEqual([
      { key: toArrangerColorKey(MAPS.id), imageUrl: MAPS.image },
    ]);
  });

  it("keeps arrangers without a picture, so they still get a fallback color", () => {
    const sources = toArrangerImageSources(
      toCalendarEvents([eventArrangedBy(MIKRO)]),
    );

    expect(sources).toEqual([
      { key: toArrangerColorKey(MIKRO.id), imageUrl: undefined },
    ]);
  });
});
