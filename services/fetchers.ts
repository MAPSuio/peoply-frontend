import { refreshAccessToken } from "./auth";

export async function fetchFromPeoplyApi(
  resource: RequestInfo,
  init?: RequestInit,
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${resource}`;
  const response = await fetch(url, { credentials: "include", ...init });
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (refresh.ok) {
      const refreshResponse = await fetch(url, {
        credentials: "include",
        ...init,
      });
      return refreshResponse.json();
    } else {
      throw new Error(`${refresh.status}, ` + refresh.statusText);
    }
  }
  return response.json();
}
