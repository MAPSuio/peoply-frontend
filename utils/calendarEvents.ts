import type { Event } from "../types/types";
import {
  type ArrangerColor,
  type ArrangerPalette,
  getArrangerColor,
  toArrangerColor,
  toArrangerColorKey,
} from "./arrangerColor";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerColorKey,
  getPrimaryEventArrangerImage,
  getPrimaryEventArrangerInitial,
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
    arrangerImageUrl?: string;
    arrangerInitial: string;
    arrangerPalette?: ArrangerPalette;
    paletteKey: string;
    sourceEvent: Event;
    startTime: string;
  };
}

export function boundedNavigationRange(now: Date) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear() + 1, now.getMonth() + 1, 1),
  };
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
        arrangerImageUrl: getPrimaryEventArrangerImage(event),
        arrangerInitial: getPrimaryEventArrangerInitial(event),
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
