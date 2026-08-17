import { afterEach, describe, expect, it, vi } from "vitest";

import type { Event, Organization } from "../types/types";
import { getCalendarLinks } from "../utils/ics";

const event = {
  id: "a657bb68-1585-49b7-b3dc-d068fb2177f1",
  urlId: "TPBKFYLJ",
  title: "Testevent",
  description: "Beskrivelse",
  startDate: "2026-07-28T14:00:00.000Z",
  endDate: "2026-07-28T18:00:00.000Z",
  freeformAddress: "Gaustadalleen 21, 0349 Oslo",
} as Event;

describe("getCalendarLinks", () => {
  it("builds a Google Calendar template link with UTC dates", () => {
    const google = getCalendarLinks(event).find(
      (link) => link.provider === "google",
    );

    expect(google?.external).toBe(true);
    const url = new URL(google?.href ?? "");
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Testevent");
    expect(url.searchParams.get("dates")).toBe(
      "20260728T140000Z/20260728T180000Z",
    );
    expect(url.searchParams.get("location")).toBe(
      "Gaustadalleen 21, 0349 Oslo",
    );
  });

  it("links Apple Kalender to the .ics endpoint by default", () => {
    const apple = getCalendarLinks(event).find(
      (link) => link.provider === "apple",
    );

    expect(apple?.href).toBe("/api/calendar/TPBKFYLJ");
    expect(apple?.external).toBe(false);
  });

  it("uses webcal:// for Apple Kalender when preferWebcal is set", () => {
    const apple = getCalendarLinks(event, { preferWebcal: true }).find(
      (link) => link.provider === "apple",
    );

    expect(apple?.href).toBe(
      `webcal://${window.location.host}/api/calendar/TPBKFYLJ`,
    );
  });

  it("falls back to a one hour duration without an end date", () => {
    const google = getCalendarLinks({ ...event, endDate: null }).find(
      (link) => link.provider === "google",
    );

    const url = new URL(google?.href ?? "");
    expect(url.searchParams.get("dates")).toBe(
      "20260728T140000Z/20260728T150000Z",
    );
  });
});

const organization = {
  id: "0a677218-d9d8-4035-af3a-350fcd896e73",
  urlId: "sifi",
} as Organization;

/* constants/urls reads NEXT_PUBLIC_API_URL once at module load - the same
   textual substitution Next does at build time - so the env has to be stubbed
   before the module is pulled in, not after. */
async function loadOrganizationCalendarLinks(apiUrl: string) {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_URL", apiUrl);

  const { getOrganizationCalendarLinks } = await import("../utils/ics");

  return getOrganizationCalendarLinks(organization);
}

describe("getOrganizationCalendarLinks", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("subscribes Apple Kalender to the feed over webcal", async () => {
    const { links } = await loadOrganizationCalendarLinks(
      "https://api.peoply.app",
    );

    expect(links.find((link) => link.provider === "apple")?.href).toBe(
      "webcal://api.peoply.app/organizations/sifi/calendar.ics",
    );
  });

  it("hands Google Calendar the feed url as cid", async () => {
    const { links } = await loadOrganizationCalendarLinks(
      "https://api.peoply.app/",
    );

    const url = new URL(
      links.find((link) => link.provider === "google")?.href ?? "",
    );
    expect(url.origin).toBe("https://calendar.google.com");
    expect(url.searchParams.get("cid")).toBe(
      "webcal://api.peoply.app/organizations/sifi/calendar.ics",
    );
  });

  it("keeps the https feed url for the .ics download", async () => {
    const { downloadHref } = await loadOrganizationCalendarLinks(
      "https://api.peoply.app",
    );

    expect(downloadHref).toBe(
      "https://api.peoply.app/organizations/sifi/calendar.ics",
    );
  });

  it("offers nothing when the api origin is not absolute", async () => {
    const { links, downloadHref } = await loadOrganizationCalendarLinks("");

    expect(links).toEqual([]);
    expect(downloadHref).toBe("");
  });
});
