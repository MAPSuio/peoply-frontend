import { BASE_URL } from "../constants/urls";
import type { Event, Organization } from "../types/types";

export type CalendarProvider = "google" | "apple";

interface CalendarLink {
  provider: CalendarProvider;
  label: string;
  description: string;
  href: string;
  external: boolean;
}

interface CalendarLinkOptions {
  /* Standalone PWAs (especially on iOS) cannot preview or download files, so
     the .ics link is dead there. webcal:// hands the URL to the native
     calendar app instead, which works from inside an installed PWA. */
  preferWebcal?: boolean;
}

interface OrganizationCalendarLink {
  subscribeHref: string;
  downloadHref: string;
}

function escapeIcsText(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function formatIcsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function getCalendarDateRange(event: Event) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate
    ? new Date(event.endDate)
    : new Date(startDate.getTime() + 60 * 60 * 1000);

  return { startDate, endDate };
}

function formatGoogleDate(date: Date) {
  return formatIcsDate(date);
}

function slugifyFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getEventUrl(event: Event) {
  const eventSlug = event.urlId || event.id;

  if (!BASE_URL || !eventSlug) return "";

  return `${BASE_URL}/events/${eventSlug}`;
}

function getEventLocation(event: Event) {
  return event.freeformAddress || event.locationName || "";
}

function getEventDescription(event: Event) {
  const parts = [event.description, getEventUrl(event)].filter(Boolean);

  return parts.join("\n\n");
}

export function createEventIcs(event: Event) {
  const { startDate, endDate } = getCalendarDateRange(event);
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peoply//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeIcsText(`${event.id}@peoply.no`)}`,
    `DTSTAMP:${formatIcsDate(now)}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(getEventDescription(event))}`,
    `LOCATION:${escapeIcsText(getEventLocation(event))}`,
    `URL:${escapeIcsText(getEventUrl(event))}`,
  ];

  lines.push(`DTEND:${formatIcsDate(endDate)}`);

  lines.push("END:VEVENT", "END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}

export function getCalendarLinks(
  event: Event,
  options?: CalendarLinkOptions,
): CalendarLink[] {
  const { startDate, endDate } = getCalendarDateRange(event);
  const title = event.title;
  const description = getEventDescription(event);
  const location = getEventLocation(event);
  const eventSlug = event.urlId || event.id || slugifyFileName(title);
  const query = new URLSearchParams({
    text: title,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: description,
    location,
  });
  const calendarFileHref = `/api/calendar/${eventSlug}`;
  const useWebcal =
    Boolean(options?.preferWebcal) && typeof window !== "undefined";
  const appleHref = useWebcal
    ? `webcal://${window.location.host}${calendarFileHref}`
    : calendarFileHref;

  return [
    {
      provider: "google",
      label: "Google Kalender",
      description: "Åpner arrangementet i Google Kalender",
      href: `https://calendar.google.com/calendar/render?action=TEMPLATE&${query.toString()}`,
      external: true,
    },
    {
      provider: "apple",
      label: "Apple Kalender",
      description: useWebcal
        ? "Åpner Kalender-appen direkte"
        : "Laster ned kalenderfil (.ics)",
      href: appleHref,
      external: false,
    },
  ];
}

export function getOrganizationCalendarLinks(
  organization: Pick<Organization, "id" | "urlId">,
): OrganizationCalendarLink {
  const organizationSlug = organization.urlId || organization.id;
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  if (!apiBaseUrl) {
    return {
      subscribeHref: "",
      downloadHref: "",
    };
  }

  const downloadHref = `${apiBaseUrl}/organizations/${organizationSlug}/calendar.ics`;

  return {
    subscribeHref: /^https?:\/\//.test(downloadHref)
      ? downloadHref.replace(/^https?:\/\//, "webcal://")
      : "",
    downloadHref,
  };
}
