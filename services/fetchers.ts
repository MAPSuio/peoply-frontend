import { ApiError, ApiTimeoutError } from "./apiError";
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

/**
 * Default budget for a single request to the Peoply API before it's treated
 * as failed. Override per call via `options.timeoutMs`.
 */
export const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchOptions {
  /** Overrides DEFAULT_TIMEOUT_MS for this call. */
  timeoutMs?: number;
}

/**
 * Best-effort read of a failed response's body, so ApiError can carry it for
 * the few callers that need to inspect it (e.g. a 429's retry-after
 * payload). Reads as text first since not every error body is JSON, and
 * swallows read failures entirely - a body we can't read is not worth
 * losing the original status-based error over.
 */
async function readErrorBody(response: Response): Promise<unknown> {
  try {
    const text = await response.text();
    if (!text) return undefined;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return undefined;
  }
}

/**
 * Runs `fetch` with an AbortController-based timeout. A timeout and any
 * other failure that happens before a response arrives (offline, DNS, CORS)
 * both surface as the same ApiTimeoutError - from the caller's side both mean
 * "we don't know what the server would have said".
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  path: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch {
    throw new ApiTimeoutError(path);
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchFromPeoplyApiJson(
  resource: RequestInfo,
  init?: RequestInit,
  options?: FetchOptions,
) {
  const res = await fetchFromPeoplyApi(resource, init, options);

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
  options?: FetchOptions,
) {
  const path = String(resource);
  const url = `${getApiBaseUrl()}${path}`;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let response = await fetchWithTimeout(
    url,
    { credentials: "include", ...init },
    path,
    timeoutMs,
  );
  if (response.status === 401) {
    const refresh = await refreshAccessToken();
    if (refresh.ok) {
      response = await fetchWithTimeout(
        url,
        { credentials: "include", ...init },
        path,
        timeoutMs,
      );
    } else {
      throw new ApiError(
        `Token refresh failed with status ${refresh.status}`,
        refresh.status,
        "/auth/refresh",
      );
    }
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    throw new ApiError(
      `Request to ${path} failed with status ${response.status}`,
      response.status,
      path,
      body,
    );
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
  options?: FetchOptions,
): Promise<T[]> {
  const separator = resource.includes("?") ? "&" : "?";
  const items: T[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const skip = page * MAX_PAGE_SIZE;
    // Some endpoints validate skip as >= 1, so omit it on the first page
    // rather than sending skip=0.
    const query = `take=${MAX_PAGE_SIZE}${skip ? `&skip=${skip}` : ""}`;
    const batch: T[] | undefined = await fetchFromPeoplyApiJson(
      `${resource}${separator}${query}`,
      undefined,
      options,
    );

    // A 204 (no content for this caller) comes back as undefined rather than
    // an empty array - treat it the same as an empty/short page: nothing more
    // to fetch, rather than crashing on `undefined.push(...)`.
    if (!batch?.length) break;

    items.push(...batch);

    if (batch.length < MAX_PAGE_SIZE) break;
  }

  return items;
}
