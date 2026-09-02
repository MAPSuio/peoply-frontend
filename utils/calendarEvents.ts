import type { Event } from "../types/types";
import {
  type ArrangerColor,
  type ArrangerPalette,
  getArrangerColor,
  toArrangerColor,
  toArrangerColorKey,
} from "./arrangerColor";
import {
  type AvatarContent,
  PEOPLY_AVATAR,
  getEventArrangerAvatarContent,
} from "./avatar";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerColorKey,
  getPrimaryEventArrangerPalette,
} from "./eventArrangers";

const DISPLAY_LOCALE = "no-NO";

const START_TIME_FORMAT = {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
} as const;

function formatStartTime(start: Date) {
  return start.toLocaleTimeString(DISPLAY_LOCALE, START_TIME_FORMAT);
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end?: Date;
  url: string;
  extendedProps: {
    arranger: string;
    arrangerAvatar: AvatarContent;
    arrangerPalette?: ArrangerPalette;
    paletteKey: string;
    sourceEvent: Event;
    startTime: string;
  };
}

export const ROLLING_WINDOW_IN_WEEKS = 5;

export const WINDOWS_SHOWN_AT_FIRST = 6;

export const WINDOWS_IN_HORIZON = 10;

const DAYS_IN_WEEK = 7;

const WINDOW_IN_DAYS = ROLLING_WINDOW_IN_WEEKS * DAYS_IN_WEEK;

const rangeFormatter = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

export interface CalendarRange {
  start: Date;
  end: Date;
}

function midnightAfter(date: Date, dayCount: number) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + dayCount,
  );
}

function startOfWeekContaining(date: Date) {
  const daysSinceMonday = (date.getDay() + 6) % DAYS_IN_WEEK;

  return midnightAfter(date, -daysSinceMonday);
}

export function rollingCalendarRange(now: Date): CalendarRange {
  return {
    start: midnightAfter(now, 0),
    end: midnightAfter(
      startOfWeekContaining(now),
      WINDOW_IN_DAYS * WINDOWS_IN_HORIZON,
    ),
  };
}

export function calendarWindows(
  now: Date,
  windowCount: number,
): CalendarRange[] {
  const shownCount = Math.min(Math.max(windowCount, 0), WINDOWS_IN_HORIZON);
  const firstWindowStart = startOfWeekContaining(now);

  return Array.from({ length: shownCount }, (_, index) => ({
    start: midnightAfter(firstWindowStart, index * WINDOW_IN_DAYS),
    end: midnightAfter(firstWindowStart, (index + 1) * WINDOW_IN_DAYS),
  }));
}

export function windowRangeLabel({ start, end }: CalendarRange): string {
  return rangeFormatter.formatRange(start, midnightAfter(end, -1));
}

export function toCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map((event) => {
    const start = new Date(event.startDate);

    return {
      id: event.id,
      title: event.title,
      start,
      end: event.endDate ? new Date(event.endDate) : undefined,
      url: `/events/${event.urlId}`,
      extendedProps: {
        arranger: getCompactEventArrangerLabel(event, 1),
        arrangerAvatar: getEventArrangerAvatarContent(event) ?? PEOPLY_AVATAR,
        arrangerPalette: getPrimaryEventArrangerPalette(event),
        paletteKey: toArrangerColorKey(getPrimaryEventArrangerColorKey(event)),
        sourceEvent: event,
        startTime: formatStartTime(start),
      },
    };
  });
}

export function toArrangerColorsByKey(
  calendarEvents: CalendarEvent[],
): Record<string, ArrangerColor> {
  const colorsByKey: Record<string, ArrangerColor> = Object.create(null);

  for (const { extendedProps } of calendarEvents) {
    const { paletteKey, arrangerPalette } = extendedProps;
    if (colorsByKey[paletteKey] && !arrangerPalette) continue;

    colorsByKey[paletteKey] = arrangerPalette
      ? toArrangerColor(arrangerPalette, paletteKey)
      : getArrangerColor(paletteKey);
  }

  return colorsByKey;
}
