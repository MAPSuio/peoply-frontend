import type { LocationSearchOptions } from "../types/locationSearch";
import { fetchFromPeoplyApiJson } from "./fetchers";

/* takes a search string and optional options to bias search */
export async function searchLocations(
  query: string,
  options?: LocationSearchOptions,
) {
  const params = new URLSearchParams({ query });

  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
  }

  return fetchFromPeoplyApiJson(`/locations/search?${params.toString()}`);
}
