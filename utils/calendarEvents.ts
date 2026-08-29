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
  };
}

export function boundedNavigationRange(now: Date) {
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear() + 1, now.getMonth() + 1, 1),
  };
}

export function toCalendarEvents(events: Event[]): CalendarEvent[] {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startDate),
    end: event.endDate ? new Date(event.endDate) : undefined,
    url: `/events/${event.urlId}`,
    extendedProps: {
      arranger: getCompactEventArrangerLabel(event, 1),
      arrangerImageUrl: getPrimaryEventArrangerImage(event),
      arrangerInitial: getPrimaryEventArrangerInitial(event),
      arrangerPalette: getPrimaryEventArrangerPalette(event),
      paletteKey: toArrangerColorKey(getPrimaryEventArrangerColorKey(event)),
      sourceEvent: event,
    },
  }));
}

export function toArrangerColorsByKey(
  calendarEvents: CalendarEvent[],
): Record<string, ArrangerColor> {
  const colorsByKey: Record<string, ArrangerColor> = {};

  for (const { extendedProps } of calendarEvents) {
    const { paletteKey, arrangerPalette } = extendedProps;
    if (colorsByKey[paletteKey] && !arrangerPalette) continue;

    colorsByKey[paletteKey] = arrangerPalette
      ? toArrangerColor(arrangerPalette)
      : getArrangerColor(paletteKey);
  }

  return colorsByKey;
}
