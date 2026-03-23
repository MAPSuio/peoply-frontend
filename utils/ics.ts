import { Event } from "../types/types";

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

function getEventUrl(event: Event) {
  const eventSlug = event.urlId || event.id;

  if (!process.env.NEXT_PUBLIC_BASE_URL || !eventSlug) return "";

  return `${process.env.NEXT_PUBLIC_BASE_URL}/events/${eventSlug}`;
}

function getEventLocation(event: Event) {
  return event.freeformAddress || event.locationName || "";
}

function getEventDescription(event: Event) {
  const parts = [event.description, getEventUrl(event)].filter(Boolean);

  return parts.join("\n\n");
}

export function createEventIcs(event: Event) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
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

  if (endDate) {
    lines.push(`DTEND:${formatIcsDate(endDate)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  return `${lines.join("\r\n")}\r\n`;
}

export function downloadEventIcs(event: Event) {
  const fileContents = createEventIcs(event);
  const blob = new Blob([fileContents], {
    type: "text/calendar;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fileName = `${(event.urlId || event.id).toLowerCase()}.ics`;

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 0);
}
