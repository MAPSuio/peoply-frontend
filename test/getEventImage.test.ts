import { describe, expect, it } from "vitest";
import { type Event, EventSource } from "../types/types";
import { getEventImage } from "../utils/event";

const ORG_LOGO = "https://blob.example/organization-images/logo.png";
const EVENT_IMAGE = "https://blob.example/event-images/banner.png";

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    urlId: "ABCDEFGH",
    startDate: "2026-09-01T17:00:00.000Z",
    endDate: null,
    regStart: null,
    regEnd: null,
    title: "Fadderuke",
    description: "",
    hasFood: false,
    visibility: "PUBLIC",
    locationName: "Blindern",
    ...overrides,
  } as Event;
}

function withOrganizationArranger(image?: string): Partial<Event> {
  return {
    eventArrangers: [
      {
        arrangerId: "arranger-1",
        arranger: {
          id: "arranger-1",
          organization: { id: "org-1", name: "Studentforeningen", image },
        },
      },
    ],
  } as Partial<Event>;
}

describe("getEventImage", () => {
  it("uses the event's own image when it has one", () => {
    const event = buildEvent({
      image: EVENT_IMAGE,
      source: EventSource.ICS,
      ...withOrganizationArranger(ORG_LOGO),
    });

    expect(getEventImage(event)).toBe(EVENT_IMAGE);
  });

  it("falls back to the host organization's logo for an ICS import", () => {
    const event = buildEvent({
      source: EventSource.ICS,
      ...withOrganizationArranger(ORG_LOGO),
    });

    expect(getEventImage(event)).toBe(ORG_LOGO);
  });

  it("leaves a manual event without an image alone", () => {
    const event = buildEvent({
      source: EventSource.MANUAL,
      ...withOrganizationArranger(ORG_LOGO),
    });

    expect(getEventImage(event)).toBeUndefined();
  });

  it("returns undefined when the host organization has no logo", () => {
    const event = buildEvent({
      source: EventSource.ICS,
      ...withOrganizationArranger(undefined),
    });

    expect(getEventImage(event)).toBeUndefined();
  });

  it("returns undefined when the ICS event has no organization arranger", () => {
    const event = buildEvent({ source: EventSource.ICS, eventArrangers: [] });

    expect(getEventImage(event)).toBeUndefined();
  });
});
