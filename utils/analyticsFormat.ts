import type {
  OrganizationAnalyticsTimeOfDay,
  OrganizationAnalyticsWeekday,
} from "../types/types";

const EM_DASH = "—";

const formatter = new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 });

const decimal = {
  // nb-NO renders negatives with U+2212; normalize to the plain hyphen the
  // rest of the UI (and the mono font) uses.
  format: (value: number) => formatter.format(value).replace("−", "-"),
};

/** "+12" / "-3" / "0" — the sign is the message. */
export function formatDelta(value: number): string {
  return value > 0 ? `+${decimal.format(value)}` : decimal.format(value);
}

export function formatPercent(rate: number | null): string {
  return rate === null ? EM_DASH : `${Math.round(rate * 100)} %`;
}

export function formatDays(days: number | null): string {
  return days === null ? EM_DASH : `${decimal.format(days)} d`;
}

/** "10 d før" — median lead time ahead of the event start. */
export function formatDaysBefore(days: number | null): string {
  return days === null ? EM_DASH : `${decimal.format(days)} d før`;
}

export function formatCount(value: number | null): string {
  return value === null ? EM_DASH : decimal.format(value);
}

const WEEKDAY_LABELS = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"];
const WEEKDAY_LABELS_LONG = [
  "Mandag",
  "Tirsdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lørdag",
  "Søndag",
];
const TIME_OF_DAY_LABELS = {
  MORNING: "morgen",
  AFTERNOON: "ettermiddag",
  EVENING: "kveld",
} as const;

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? EM_DASH;
}

export function weekdayLabelLong(weekday: number): string {
  return WEEKDAY_LABELS_LONG[weekday] ?? EM_DASH;
}

/** "Tor kveld" — the weekday and time of day with the highest turnout. */
export function bestTimeLabel(
  byWeekday: OrganizationAnalyticsWeekday[],
  byTimeOfDay: OrganizationAnalyticsTimeOfDay[],
): string {
  const bestDay = byWeekday
    .filter((bucket) => bucket.eventCount > 0)
    .sort((a, b) => b.averageGoing - a.averageGoing)[0];

  if (!bestDay) {
    return EM_DASH;
  }

  const bestTime = byTimeOfDay
    .filter((bucket) => bucket.eventCount > 0)
    .sort((a, b) => b.averageGoing - a.averageGoing)[0];

  const dayLabel = weekdayLabel(bestDay.weekday);
  return bestTime
    ? `${dayLabel} ${TIME_OF_DAY_LABELS[bestTime.bucket]}`
    : dayLabel;
}
