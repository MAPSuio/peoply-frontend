import { getApiBaseUrl } from "./apiUrl";
import { fetchFromPeoplyApi } from "./fetchers";

/**
 * Tracks an in-flight refresh so that several concurrent 401s in the same
 * browser tab result in a single /auth/refresh call.
 *
 * Browser-only on purpose: see refreshAccessToken below.
 */
let refreshPromise: Promise<Response> | null = null;

/* will request the backend to remove auth cookies from clienty */
export async function logout() {
  const url = `/auth/logout`;
  return fetchFromPeoplyApi(url, { method: "POST" });
}

/* will refresh access token by using a refresh token */
export async function refreshAccessToken() {
  // Must use the same internal/public base-URL resolution as fetchers.ts.
  // Hardcoding the public URL here meant server-side refreshes went out over
  // the very path the internal URL exists to avoid.
  const url = `${getApiBaseUrl()}/auth/refresh`;
  const requestRefresh = () =>
    fetch(url, { method: "POST", credentials: "include" });

  // On the server, module scope is per-process rather than per-request. Sharing
  // the singleton there would let two concurrent SSR requests from different
  // users await the same refresh, so the second one would consume the first
  // user's response. Deduplication is only safe - and only useful - in the
  // browser, where the module belongs to a single session.
  if (typeof window === "undefined") {
    return requestRefresh();
  }

  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function deleteMe() {
  const url = `/users/me`;
  return fetchFromPeoplyApi(url, { method: "DELETE" });
}
