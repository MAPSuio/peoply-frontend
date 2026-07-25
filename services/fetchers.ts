import { getApiBaseUrl } from "./apiUrl";
import { refreshAccessToken } from "./auth";

/**
 * Upper bound the API enforces on `take` for paginated endpoints. Mirrors
 * MAX_PAGE_SIZE in the backend - asking for more is a 400, not a clamp.
 */
export const MAX_PAGE_SIZE = 100;

/**
 * Stops a pathological data set from turning into an unbounded request loop.
 * 50 pages is far more than any current view needs.
 */
const MAX_PAGES = 50;

export async function fetchFromPeoplyApiJson(
  resource: RequestInfo,
  init?: RequestInit,
) {
  const res = await fetchFromPeoplyApi(resource, init);

  /* The API answers "this resource does not exist for you" with 204 and an
     empty body - GET /users/:id/registrations/:eventId does it for every event
     the user has not signed up for. Calling .json() on that throws a
     SyntaxError, which is not a Response, so it slips past the status-based
     suppression in SwrProvider's onError and snacks at the user. Absence is a
     legitimate answer, so return it as one. */
  if (res.status === 204) return undefined;

  return res.json();
}

export async function fetchFromPeoplyApi(
  resource: RequestInfo,
  init?: RequestInit,
  // version = "v1",
) {
  const url = `${getApiBaseUrl()}${resource}`;
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

/**
 * Fetches every page of a paginated endpoint and returns the concatenation.
 *
 * Views that need the complete set used to ask for `take=500`, which the API
 * rejects outright. Walking the pages keeps those views complete instead of
 * silently truncating them at whatever the cap happens to be.
 *
 * Pass the resource *without* `take`/`skip` - they are appended here.
 */
export async function fetchAllFromPeoplyApiJson<T>(
  resource: string,
): Promise<T[]> {
  const separator = resource.includes("?") ? "&" : "?";
  const items: T[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * MAX_PAGE_SIZE;
    // Some endpoints validate skip as >= 1, so omit it on the first page
    // rather than sending skip=0.
    const query = `take=${MAX_PAGE_SIZE}${skip ? `&skip=${skip}` : ""}`;
    const batch: T[] = await fetchFromPeoplyApiJson(
      `${resource}${separator}${query}`,
    );

    items.push(...batch);

    if (batch.length < MAX_PAGE_SIZE) break;
  }

  return items;
}
