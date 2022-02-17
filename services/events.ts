import { formatDateRange, formatTimeRange } from "../utils/functions";
import { EventData, RegStatus } from "../types/types";
import useSnack from "../hooks/useSnack";

/* Fetches and returns the top X most popular events. */
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

/* Fetches and returns the events the user hosts. */
async function getMyEvents(userId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/arranging`;
  const res = await fetch(url, { method: "GET", credentials: "include" });
  console.log("Test");

  if (res.ok) {
    const myEvents = await res.json();

    return myEvents;
  } else {
    throw new Error("Could not fetch the events.");
  }
}

/* Fetches and returns events the user is signed up for. */
async function getEventsGoing(userId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations?regStatus=${RegStatus.Going}&includeEvent=true`;
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (res.ok) {
    const eventsGoing = await res.json();

    return eventsGoing;
  } else {
    throw new Error("Could not fetch the events.");
  }
}

/* Fetches and returns events the user has favorited. */
async function getEventsFavorited(userId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/favorites?includeEvent=true`;
  const res = await fetch(url, { method: "GET", credentials: "include" });

  if (res.ok) {
    const eventsFavorited = await res.json();

    return eventsFavorited;
  } else {
    console.log({ res });
    throw new Error("Could not fetch the events.");
  }
}

async function registerForEventTest(userId: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations`;

  const data = {
    eventId: "3630e0aa-db9a-46b2-9efc-3138956a1a45",
    regStatus: RegStatus.Going,
  };

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (res.ok) {
    const going = await res.json();

    return going;
  } else {
    return false;
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

export {
  getTopXEvents,
  getEventData,
  getMyEvents,
  getEventsGoing,
  getEventsFavorited,
  registerForEventTest,
};
