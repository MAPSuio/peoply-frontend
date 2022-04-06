import { formatDateRange, formatTimeRange } from "../utils/functions";
import {
  EventData,
  RegStatus,
  FavoriteData,
  RegistrationData,
} from "../types/types";
import { fetchFromPeoplyApi, fetchFromPeoplyApiJson } from "./fetchers";

/* Fetches and returns the top X most popular events. */
async function getTopXEvents(numEvents: number) {
  const url = `/events?take=${numEvents}`;
  const res = await fetchFromPeoplyApi(url, { method: "GET" });

  if (res.ok) {
    const topXEvents = await res.json();

    return topXEvents;
  } else {
    throw new Error("Could not fetch the events.");
  }
}

async function registerForEventTest(userId: string) {
  const url = `/users/${userId}/registrations`;

  const data = {
    eventId: "3630e0aa-db9a-46b2-9efc-3138956a1a45",
    regStatus: RegStatus.GOING,
  };

  const res = await fetchFromPeoplyApi(url, {
    method: "POST",
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
async function getEventData(eid: string) {
  const eventUrl = `/events/${eid}`;
  const res = await fetchFromPeoplyApiJson(eventUrl, {
    method: "get",
  });

  const eventData = res;

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
    visibility: eventData.visibility,
    image: eventData.image,
  };

  return event;
}

async function getUserFavorite(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/favorites/${eventId}`;
  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "GET",
  });

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
  const eventUrl = `/users/${userId}/favorites`;
  const requestBody = {
    id: eventId,
  };
  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

/*remove event as favorite. returns true/false if done succesfull */
async function removeFavorite(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/favorites`;
  const requestBody = {
    id: eventId,
  };

  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

async function getUserRegistration(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/registrations/${eventId}`;
  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "GET",
  });

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
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: status,
  };

  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 201;
}

/* add event as favorite. returns true/false if done succesfull */
async function unregisterUser(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: RegStatus.NOTGOING,
  };

  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res.status === 200;
}

/* add event as favorite. returns true/false if done succesfull */
async function deleteRegistrationUser(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
  };

  const res = await fetchFromPeoplyApi(eventUrl, {
    method: "DELETE",
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
  registerForEventTest,
  getUserRegistration,
  registerUser,
  unregisterUser,
  deleteRegistrationUser,
};
