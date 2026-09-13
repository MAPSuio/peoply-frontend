import { useEffect, useRef, useState } from "react";

import { searchLocations } from "../services/locationSearch";
import type {
  LocationSearchOptions,
  LocationSearchResponse,
  LocationSearchResult,
} from "../types/locationSearch";
import useDebouncedSearch from "./useDebouncedSearch";
import useDismissOnOutsidePointer from "./useDismissOnOutsidePointer";

const SEARCH_DELAY_MS = 500;

export interface LocationSearchFieldOptions {
  selectedLocation?: LocationSearchResult;
  options?: LocationSearchOptions;
  onLocationSelect: (location?: LocationSearchResult) => void;
}

export default function useLocationSearchField({
  selectedLocation,
  options,
  onLocationSelect,
}: LocationSearchFieldOptions) {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState<string>();
  const [locations, setLocations] = useState<LocationSearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const { results, loading } = useDebouncedSearch(
    search ?? "",
    (query: string): Promise<LocationSearchResponse> =>
      searchLocations(query, options),
    { delayMs: SEARCH_DELAY_MS, minLength: 1 },
  );

  useEffect(() => {
    setLocations(results?.results ?? []);
  }, [results]);

  const closeResults = () => {
    setSearch(undefined);
    setLocations([]);
  };

  useDismissOnOutsidePointer(containerRef, () => setLocations([]));

  return {
    containerRef,
    focused,
    loading,
    locations,
    valid: Boolean(selectedLocation),
    value: search ?? selectedLocation?.address?.freeformAddress ?? "",
    onFocus: () => {
      setFocused(true);
      closeResults();
    },
    onBlur: () => {
      setFocused(false);
      setSearch(undefined);
    },
    onSearchChange: (query: string) => {
      if (query !== " ") {
        setSearch(query);
        setLocations([]);
      }
    },
    onClear: () => {
      if (!locations.length) {
        onLocationSelect(undefined);
      }
      closeResults();
    },
    onSelect: (location: LocationSearchResult) => {
      onLocationSelect(location);
      closeResults();
    },
  };
}
