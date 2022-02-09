import { formatDateRange, formatTimeRange } from "../utils/functions";
import { EventData } from "../types/types";

// Fetches and returns the top X most popular events.
async function getTopXEvents(numEvents: number) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/events?take=${numEvents}`;
  const res = await fetch(url, { method: "GET" });

  if (res.ok) {
    const topXEvents = await res.json();

    return topXEvents;
  } else {
    throw new Error("Could not fetch the events.");
  }
}

// Fetch and format data for an event specified by an event ID.
async function getEventData(eid: number) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/events/${eid}`;
  const res = await fetch(eventUrl, { method: "GET" });
  const eventData = await res.json();

  // Extract event data and format in new object.
  const startDate = new Date(eventData.startDate);
  const endDate = new Date(eventData.endDate);

  const dateString = formatDateRange(startDate, endDate);
  const timeString = formatTimeRange(startDate, endDate);

  const event: EventData = {
    eventId: eid,
    dateString: dateString,
    timeString: timeString,
    title: eventData.title,
    description: eventData.description,
    capacity: eventData.capacity,
    private: eventData.private,
    image: eventData.image,
  };

  return event;
}

export { getTopXEvents, getEventData };
