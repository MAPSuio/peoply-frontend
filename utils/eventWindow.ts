const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * The `afterDate`/`beforeDate` boundary that splits an event list into what is
 * still coming and what has been.
 *
 * Quantized to the hour, and that is the whole point. The value ends up inside
 * the SWR key, so a fresh `new Date()` per mount produced a different key every
 * time a page was opened: going from an organization to its full event list and
 * back missed the cache, refetched everything and rendered an empty list while
 * it waited. One key per hour keeps the window current without throwing the
 * cache away on every navigation.
 *
 * `offsetMs` shifts the boundary back for callers that want to keep an event
 * listed for a while after it has started; the result is floored either way.
 */
export function eventWindowBoundary(offsetMs = 0) {
  const boundary = Date.now() - offsetMs;

  return new Date(Math.floor(boundary / HOUR_IN_MS) * HOUR_IN_MS).toISOString();
}

/**
 * The front page keeps an event with an explicit endDate listed for two hours
 * after it ends ("passive promo"), and an event without an endDate for two
 * hours after it starts.
 */
export const FRONT_PAGE_GRACE_MS = 2 * HOUR_IN_MS;

/**
 * The API filters `afterDate` against `startDate`, not `endDate`. Querying 24
 * hours back ensures multi-hour ongoing events and recently finished events
 * (within the 2-hour post-end grace window) still arrive from the API before
 * `isVisibleOnFrontPage` trims them client-side.
 */
export const FRONT_PAGE_FETCH_LOOKBACK_MS = 24 * HOUR_IN_MS;
