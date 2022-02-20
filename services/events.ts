import { formatDateRange, formatTimeRange } from "../utils/functions";
import {
  EventData,
  RegStatus,
  FavoriteData,
  Registration,
  RegistrationData,
} from "../types/types";

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
  const url = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations?regStatus=${RegStatus.GOING}&includeEvent=true`;
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
    regStatus: RegStatus.GOING,
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

/* Fetch and format data for an event specified by an event ID. */
async function getEventData(eid: number) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/events/${eid}`;
  const res = await fetch(eventUrl, { method: "GET" });
  const eventData = await res.json();

  /* Extract event data and format in new object. */
  const startDate = new Date(eventData.startDate);
  const endDate = new Date(eventData.endDate);

  const dateString = formatDateRange(startDate, endDate);
  const timeString = formatTimeRange(startDate, endDate);

  const event: EventData = {
    eventId: eid,
    eventUuid: eventData.id,
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

async function getUserFavorite(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/favorites/${eventId}`;
  const res = await fetch(eventUrl, { method: "GET", credentials: "include" });

  /* no favorite */
  if (res.status === 204) {
    return null;
  }

  const favoriteData = await res.json();
  const favorite: FavoriteData = {
    userId: favoriteData.userId,
    eventId: favoriteData.eventId,
    favoritedDate: favoriteData.favoritedDate,
  };

  return favorite;
}

/* add event as favorite. returns true/false if done succesfull */
async function addFavorite(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/favorites`;
  const requestBody = {
    id: eventId,
  };

  const res = await fetch(eventUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

/*remove event as favorite. returns true/false if done succesfull */
async function removeFavorite(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/favorites`;
  const requestBody = {
    id: eventId,
  };

  const res = await fetch(eventUrl, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

async function getUserRegistration(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations/${eventId}`;
  const res = await fetch(eventUrl, { method: "GET", credentials: "include" });

  /* no registration */
  if (res.status === 204) {
    return null;
  }

  const registrationData = await res.json();
  const registration: RegistrationData = {
    eventId: registrationData.eventId,
    userId: registrationData.userId,
    regDate: registrationData.regDate,
    regStatus: registrationData.regStatus,
    attendance: registrationData.attendance,
  };

  return registration;
}

/* add event as favorite. returns true/false if done succesfull */
async function registerUser(
  userId: string,
  eventId: string,
  status: RegStatus,
) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: status,
  };

  const res = await fetch(eventUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 201;
}

/* add event as favorite. returns true/false if done succesfull */
async function unregisterUser(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: RegStatus.NOTGOING,
  };

  const res = await fetch(eventUrl, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

/* add event as favorite. returns true/false if done succesfull */
async function deleteRegistrationUser(userId: string, eventId: string) {
  const eventUrl = `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
  };

  const res = await fetch(eventUrl, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

export {
  getTopXEvents,
  getEventData,
  getUserFavorite,
  addFavorite,
  removeFavorite,
  getMyEvents,
  getEventsGoing,
  getEventsFavorited,
  registerForEventTest,
  getUserRegistration,
  registerUser,
  unregisterUser,
  deleteRegistrationUser,
};
