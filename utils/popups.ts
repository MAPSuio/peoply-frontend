import { ApiError } from "../services/apiError";

/** The popup a rejected interval collided with, as the API reports it. */
export interface PopupConflict {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
}

/**
 * Reads the popup behind a 409 out of the error body.
 *
 * "Tidsrommet overlapper en annen popup" is unactionable on its own: the
 * scheduler list only revalidates after a successful write, so the popup the
 * interval collided with is usually not on screen and the conflict reads as
 * invented. Returns undefined when the API did not name one, so callers keep
 * the plain message.
 */
export function popupConflict(error: unknown): PopupConflict | undefined {
  if (!(error instanceof ApiError) || typeof error.body !== "object") {
    return undefined;
  }

  const { conflictingPopup } = (error.body ?? {}) as {
    conflictingPopup?: unknown;
  };
  if (typeof conflictingPopup !== "object" || conflictingPopup === null) {
    return undefined;
  }

  const { id, title, startsAt, endsAt } = conflictingPopup as Record<
    keyof PopupConflict,
    unknown
  >;

  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof startsAt !== "string" ||
    typeof endsAt !== "string"
  ) {
    return undefined;
  }

  return { id, title, startsAt, endsAt };
}

const dayMonthFormatter = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});
const fullDateFormatter = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatPopupRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (start.toDateString() === end.toDateString()) {
    return fullDateFormatter.format(start);
  }
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    return `${start.getDate()}.–${fullDateFormatter.format(end)}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${dayMonthFormatter.format(start)}–${fullDateFormatter.format(end)}`;
  }
  return `${fullDateFormatter.format(start)}–${fullDateFormatter.format(end)}`;
}

export function toDateTimeLocal(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function fromDateTimeLocal(value: string) {
  return new Date(value).toISOString();
}

/**
 * The interval a new popup starts out with: live now, for an hour.
 *
 * The start used to be rounded *up* to the next quarter-hour, which put a
 * popup created with the defaults up to 15 minutes in the future. It saved
 * fine and then sorted under "Kommende" rather than "Aktiv pop-up", with
 * /popups/active still answering "nothing scheduled" - indistinguishable from
 * a create that silently did nothing.
 */
export function getDefaultInterval(now = new Date()) {
  return {
    /* toDateTimeLocal truncates to the minute, so this lands a few seconds in
       the past and the popup is active the moment it is saved. */
    startsAt: toDateTimeLocal(now),
    endsAt: toDateTimeLocal(new Date(now.getTime() + 60 * 60 * 1000)),
  };
}
