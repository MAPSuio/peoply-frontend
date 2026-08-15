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
