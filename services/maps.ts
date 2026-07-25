import { AzureMapsSearchFuzzyOptions } from "../types/azureMaps";
import { fetchFromPeoplyApiJson } from "./fetchers";

/* takes a search string and optional options to bias search */
export async function searchLocationsFuzzy(
  query: string,
  options?: AzureMapsSearchFuzzyOptions,
) {
  // keep only the options that are actually set; URLSearchParams would
  // otherwise serialise `undefined` into the query string
  const opts: Record<string, string> = {};
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (value !== undefined) {
        // arrays (e.g. countrySet) join with commas, which is the format the
        // Azure Maps API expects
        opts[key] = String(value);
      }
    }
  }

  const result = fetchFromPeoplyApiJson(
    `/maps/fuzzySearch?${new URLSearchParams({
      query: query,
      ...opts,
    }).toString()}`,
  );
  return result;
}
