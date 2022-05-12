import { Models } from "azure-maps-rest";
import { fetchFromPeoplyApiJson } from "./fetchers";

/* takes a search string and optional options to bias search */
export async function searchLocationsFuzzy(
  query: string,
  options?: Models.SearchGetSearchFuzzyOptionalParams,
) {
  // make an object with only the fields that are not undefined from options
  const opts = options
    ? Object.keys(options).reduce((acc: any, key) => {
        if (options[key] !== undefined) {
          acc[key] = options[key];
        }
        return acc;
      }, {})
    : {};

  const result = fetchFromPeoplyApiJson(
    `/maps/fuzzySearch?${new URLSearchParams({
      query: query,
      ...opts,
    }).toString()}`,
  );
  return result;
}
