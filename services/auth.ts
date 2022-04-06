import { fetchFromPeoplyApi } from "./fetchers";

/* will request the backend to remove auth cookies from clienty */
export async function logout() {
  const url = `/auth/logout`;
  return fetchFromPeoplyApi(url, { method: "GET" });
}

/* will refresh access token by using a refresh token */
export async function refreshAccessToken() {
  const url = `/auth/refresh`;
  return fetchFromPeoplyApi(url, { method: "GET", credentials: "include" });
}
