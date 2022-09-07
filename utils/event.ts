import { Event } from "../types/types";

export function isEventFinished(event: Event): boolean {
  if (!event.endDate) {
    const endOfDayToday = new Date();
    endOfDayToday.setHours(23, 59, 59, 999);
    return new Date(event.startDate) < endOfDayToday;
  }

  return new Date(event.endDate) < new Date();
}
