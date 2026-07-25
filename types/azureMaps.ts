/**
 * Local typings for the subset of the Azure Maps "Search Fuzzy" API that this
 * app actually consumes.
 *
 * These replace the `azure-maps-rest` package, which was depended on purely for
 * its type declarations - no runtime code from it was ever used. That package
 * sits on the deprecated `@azure/ms-rest-js` v1 stack and dragged in a
 * vulnerable transitive tree (axios, xml2js, tough-cookie) with no fixed
 * version available upstream.
 *
 * Fields mirror the Azure Maps REST response shape. Everything is optional
 * because the service omits keys rather than returning nulls, which is why the
 * consuming code reads through with optional chaining.
 *
 * @see https://learn.microsoft.com/en-us/rest/api/maps/search/get-search-fuzzy
 */

/** Latitude/longitude pair as returned in a search result's `position`. */
export interface AzureMapsCoordinate {
  lat?: number;
  lon?: number;
}

/** Structured address breakdown attached to a search result. */
export interface AzureMapsSearchResultAddress {
  country?: string;
  countryCode?: string;
  countryCodeISO3?: string;
  countrySubdivision?: string;
  freeformAddress?: string;
  localName?: string;
  municipality?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
}

/** Point-of-interest metadata, present when the result is a named place. */
export interface AzureMapsSearchResultPoi {
  name?: string;
}

/** A single entry in a fuzzy search response. */
export interface AzureMapsSearchFuzzyResult {
  id?: string;
  /** One of: POI, Street, Geography, Point Address, Address Range, Cross Street. */
  type?: string;
  score?: number;
  address?: AzureMapsSearchResultAddress;
  poi?: AzureMapsSearchResultPoi;
  position?: AzureMapsCoordinate;
}

/** Response body of a successful fuzzy search. */
export interface AzureMapsSearchFuzzyResponse {
  results?: AzureMapsSearchFuzzyResult[];
}

/**
 * Query parameters used to bias fuzzy search results. Serialised onto the
 * request query string by `searchLocationsFuzzy`.
 */
export interface AzureMapsSearchFuzzyOptions {
  /** Restricts results to these country codes, e.g. ["NO"]. */
  countrySet?: string[];
  /** Latitude to bias results towards. */
  lat?: number;
  /** Longitude to bias results towards. */
  lon?: number;
  /** Maximum number of results. Default 10, max 100. */
  limit?: number;
  /** Radius in metres to constrain results to. */
  radius?: number;
  /** Treats the query as partial input for predictive search. */
  typeahead?: boolean;
}
