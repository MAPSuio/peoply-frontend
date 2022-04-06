import { refreshAccessToken } from "./auth";

export async function fetchFromPeoplyApiJson(
  resource: RequestInfo,
  init?: RequestInit,
) {
  const res = await fetchFromPeoplyApi(resource, init);
  return res.json();
}

export async function fetchFromPeoplyApi(
  resource: RequestInfo,
  init?: RequestInit,
) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}${resource}`;
  let response = await fetch(url, { credentials: "include", ...init });
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (refresh.ok) {
      response = await fetch(url, {
        credentials: "include",
        ...init,
      });
    } else {
      throw new Error(`${refresh.status}, ` + refresh.statusText);
    }
  }
  return response;
}
