import { RegStatus, FavoriteData, Registration } from "../types/types";
import { fetchFromPeoplyApi, fetchFromPeoplyApiJson } from "./fetchers";

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

  try {
    const res = await fetchFromPeoplyApi(eventUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    return res.status === 201;
  } catch (error) {
    return false;
  }
}

/*remove event as favorite. returns true/false if done succesfull */
async function removeFavorite(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/favorites`;
  const requestBody = {
    id: eventId,
  };

  try {
    const res = await fetchFromPeoplyApi(eventUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return res.status === 200;
  } catch (error) {
    return false;
  }
}

/* add event as favorite. returns true/false if done succesfull */
async function registerUser(
  userId: string,
  eventId: string,
  status: RegStatus,
  formAnswer?: string,
) {
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: status,
    formAnswer: formAnswer,
  };

  const res: Promise<Registration> = fetchFromPeoplyApiJson(eventUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return res;
}

/* add event as favorite. returns true/false if done succesfull */
async function unregisterUser(userId: string, eventId: string) {
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: RegStatus.NOT_GOING,
  };

  return fetchFromPeoplyApiJson(eventUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
}

async function updateRegistrationUser(
  userId: string,
  eventId: string,
  status: RegStatus,
  formAnswer?: string,
) {
  const eventUrl = `/users/${userId}/registrations`;
  const requestBody = {
    eventId: eventId,
    regStatus: status,
    formAnswer: formAnswer,
  };

  return fetchFromPeoplyApiJson(eventUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });
}

export {
  getUserFavorite,
  addFavorite,
  removeFavorite,
  registerUser,
  unregisterUser,
  updateRegistrationUser,
};
