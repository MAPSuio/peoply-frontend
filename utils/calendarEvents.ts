import type { ArrangerImageSource } from "../hooks/useArrangerPalettes";
import type { Event } from "../types/types";
import { toArrangerColorKey } from "./arrangerColor";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerColorKey,
  getPrimaryEventArrangerImage,
  getPrimaryEventArrangerInitial,
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
      paletteKey: toArrangerColorKey(getPrimaryEventArrangerColorKey(event)),
      sourceEvent: event,
    },
  }));
}

export function toArrangerImageSources(
  calendarEvents: CalendarEvent[],
): ArrangerImageSource[] {
  const byKey = new Map<string, ArrangerImageSource>();

  for (const { extendedProps } of calendarEvents) {
    const known = byKey.get(extendedProps.paletteKey);
    byKey.set(extendedProps.paletteKey, {
      key: extendedProps.paletteKey,
      imageUrl: known?.imageUrl ?? extendedProps.arrangerImageUrl,
    });
  }

  return [...byKey.values()];
}
