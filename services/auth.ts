import { fetchFromPeoplyApi } from "./fetchers";

let refreshPromise: Promise<Response> | null = null;

/* will request the backend to remove auth cookies from clienty */
export async function logout() {
  const url = `/auth/logout`;
  return fetchFromPeoplyApi(url, { method: "POST" });
}

/* will refresh access token by using a refresh token */
export async function refreshAccessToken() {
  if (!refreshPromise) {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`;
    refreshPromise = fetch(url, { method: "POST", credentials: "include" })
      .then((response) => response)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function deleteMe() {
  const url = `/users/me`;
  return fetchFromPeoplyApi(url, { method: "DELETE" });
}
