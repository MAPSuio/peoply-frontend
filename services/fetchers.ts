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
  // version = "v1",
) {
  // Server-side fetches use the internal DO URL to bypass Cloudflare bot protection.
  // Client-side continues using the public URL.
  const baseUrl =
    typeof window === "undefined" && process.env.API_INTERNAL_URL
      ? process.env.API_INTERNAL_URL
      : process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}${resource}`;
  let response = await fetch(url, { credentials: "include", ...init });
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (refresh.ok) {
      response = await fetch(url, {
        credentials: "include",
        ...init,
      });
    } else {
      throw refresh;
    }
  }

  if (!response.ok) {
    throw response;
  }

  return response;
}
