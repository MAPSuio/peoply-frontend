import type { Event } from "../types/types";
import { formatDateAndTime } from "./functions";

export function isEventFinished(event: Event): boolean {
  if (!event.endDate) {
    const endOfDayToday = new Date();
    endOfDayToday.setHours(23, 59, 59, 999);
    return new Date(event.startDate) < endOfDayToday;
  }

  return new Date(event.endDate) < new Date();
}

/* The external registration URL is arbitrary user input from the event form -
   only http(s) may reach an href or window.open (blocks javascript: etc.). */
export function getSafeExternalUrl(event: Event): string | undefined {
  if (!event.externalUrl) {
    return undefined;
  }

  try {
    const parsed = new URL(event.externalUrl);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    /* Malformed URL - treat as absent. */
  }
  return undefined;
}

export function isEventRegStartDateValid(
  regStartDate: string,
  eventStartDate: string,
): boolean {
  if (!regStartDate) {
    return false;
  }

  const regStart = new Date(regStartDate);
  return regStart <= new Date(eventStartDate);
}

export function isEventRegStartTimeValid(
  regStartDate: string,
  regStartTime: string,
  eventStartDate: string,
  eventStartTime: string,
) {
  if (!regStartDate || !regStartTime) {
    return false;
  }

  const regStart = formatDateAndTime(regStartDate, regStartTime);
  const eventStart = formatDateAndTime(eventStartDate, eventStartTime);
  return regStart < eventStart;
}

export function isEventRegEndDateValid(
  regStartDate: string,
  regEndDate: string,
  eventEndDate: string,
): boolean {
  if (!regEndDate) {
    return false;
  }

  const regEnd = new Date(regEndDate);

  if (regStartDate) {
    const regStart = new Date(regStartDate);
    return regStart <= regEnd && regEnd <= new Date(eventEndDate);
  }
  // TODO this must be changed
  return regEnd <= new Date(eventEndDate);
}

export function isEventRegEndTimeValid(
  regStartDate: string,
  regStartTime: string,
  regEndDate: string,
  regEndTime: string,
  eventEndDate?: string,
  eventEndTime?: string,
) {
  if (!regEndDate || !regEndTime) {
    return false;
  }

  const regEnd = formatDateAndTime(regEndDate, regEndTime);

  if (regStartDate && regStartTime) {
    const regStart = formatDateAndTime(regStartDate, regStartTime);

    if (eventEndDate && eventEndTime) {
      const eventEnd = formatDateAndTime(eventEndDate, eventEndTime);
      return regStart < regEnd && regEnd <= eventEnd;
    }
    return regStart < regEnd;
  }
  return true;
}
