import { describe, expect, it } from "vitest";

import { MAX_PAGE_SIZE } from "../services/fetchers";
import type { Event } from "../types/types";
import {
  buildEventsQuery,
  filterEvents,
  groupEventsByMonth,
} from "../utils/eventListing";

const NOW = new Date("2026-05-04T10:00:00.000Z");

function eventWith(overrides: Partial<Event>): Event {
  return {
    id: "e1",
    title: "Kodekveld",
    startDate: "2026-05-04T18:00:00.000Z",
    eventArrangers: [],
    eventCategories: [],
    ...overrides,
  } as Event;
}

describe("buildEventsQuery", () => {
  it("asks for the coming year when the url says nothing", () => {
    const query = buildEventsQuery({}, NOW);

    expect(query.afterDate).toBe(NOW.toISOString());
    expect(query.beforeDate).toBe("2027-05-04T10:00:00.000Z");
    expect(query.orderBy).toBe("startDate");
    expect(query.orderDirection).toBe("asc");
    expect(query.take).toBeUndefined();
  });

  it("keeps the range the url asks for", () => {
    const query = buildEventsQuery(
      {
        afterDate: "2026-01-01T00:00:00.000Z",
        beforeDate: "2026-02-01T00:00:00.000Z",
        orderBy: "title",
        orderDirection: "desc",
      },
      NOW,
    );

    expect(query.afterDate).toBe("2026-01-01T00:00:00.000Z");
    expect(query.beforeDate).toBe("2026-02-01T00:00:00.000Z");
    expect(query.orderBy).toBe("title");
    expect(query.orderDirection).toBe("desc");
  });

  it("clamps a hand-written take to what the api accepts", () => {
    expect(buildEventsQuery({ take: "5000" }, NOW).take).toBe(
      `${MAX_PAGE_SIZE}`,
    );
    expect(buildEventsQuery({ take: "12" }, NOW).take).toBe("12");
  });
});

describe("filterEvents", () => {
  const events = [
    eventWith({
      id: "a",
      title: "Bedriftspresentasjon",
      eventCategories: [{ categoryId: 1 }] as Event["eventCategories"],
    }),
    eventWith({
      id: "b",
      title: "Åpen scene",
      eventCategories: [{ categoryId: 2 }] as Event["eventCategories"],
    }),
  ];

  it("keeps everything when nothing is selected", () => {
    expect(
      filterEvents(events, {
        selectedOrganizationIds: [],
        selectedCategoryIds: [],
        search: "",
      }).map(({ id }) => id),
    ).toEqual(["a", "b"]);
  });

  it("keeps only the selected categories", () => {
    expect(
      filterEvents(events, {
        selectedOrganizationIds: [],
        selectedCategoryIds: [2],
        search: "",
      }).map(({ id }) => id),
    ).toEqual(["b"]);
  });

  it("matches the search term without diacritics", () => {
    expect(
      filterEvents(events, {
        selectedOrganizationIds: [],
        selectedCategoryIds: [],
        search: "apen",
      }).map(({ id }) => id),
    ).toEqual(["b"]);
  });

  it("requires every search term to match", () => {
    expect(
      filterEvents(events, {
        selectedOrganizationIds: [],
        selectedCategoryIds: [],
        search: "apen kodekveld",
      }),
    ).toEqual([]);
  });
});

describe("groupEventsByMonth", () => {
  it("groups by month with a capitalised Norwegian label", () => {
    const groups = groupEventsByMonth([
      eventWith({ id: "a", startDate: "2026-05-04T18:00:00.000Z" }),
      eventWith({ id: "b", startDate: "2026-05-20T18:00:00.000Z" }),
      eventWith({ id: "c", startDate: "2026-06-01T18:00:00.000Z" }),
    ]);

    expect(groups.map(({ label }) => label)).toEqual(["Mai 2026", "Juni 2026"]);
    expect(groups[0].events.map(({ id }) => id)).toEqual(["a", "b"]);
    expect(groups[1].events.map(({ id }) => id)).toEqual(["c"]);
  });
});
