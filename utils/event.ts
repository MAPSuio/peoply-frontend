import { type Event, EventRegistrationMode, EventSource } from "../types/types";
import { getPrimaryEventArrangerOrganization } from "./eventArrangers";
import { formatDateAndTime } from "./functions";

/* An event that hands registration off to another site is not signed up for
   in Peoply, so whatever registrations we hold for it are leftovers or noise -
   never the turnout. Showing that number anywhere states something we do not
   know, so no surface may render it: not a card, not the event page, not the
   count request behind them. Every attendee count goes through this. */
export function showsRegistrationCount(
  event?: Pick<Event, "registrationMode">,
): boolean {
  return event?.registrationMode !== EventRegistrationMode.EXTERNAL;
}

/* Events imported from an .ics feed never carry an image: the calendar format
   has no field for one, and the events are read-only so nobody can upload one
   afterwards. The host organization's logo says more about the event than the
   shared placeholder does, so it takes precedence over the placeholder.
   Returns undefined when there is nothing to show - the caller picks its own
   placeholder, which differs between the card and the detail page. */
export function getEventImage(event: Event): string | undefined {
  if (event.image) {
    return event.image;
  }

  if (event.source !== EventSource.ICS) {
    return undefined;
  }

  return getPrimaryEventArrangerOrganization(event)?.image;
}

export function isEventFinished(event: Event): boolean {
  if (!event.endDate) {
    /* Without an end date the event is assumed to last out its start day, so
       it is only finished once that day is over. */
    const endOfStartDay = new Date(event.startDate);
    endOfStartDay.setHours(23, 59, 59, 999);
    return endOfStartDay < new Date();
  }

  return new Date(event.endDate) < new Date();
}

/* The external registration URL is arbitrary user input from the event form -
   only http(s) may reach an href or window.open (blocks javascript: etc.). */
export function getSafeExternalUrl(event: Event): string | undefined {
  return getSafeHttpUrl(event.externalUrl);
}

export function getSafeHttpUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);
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
