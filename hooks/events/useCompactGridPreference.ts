import { useEffect, useState } from "react";

const COMPACT_GRID_STORAGE_KEY = "eventsCompactGrid";

export default function useCompactGridPreference(): [
  boolean,
  (isCompactGrid: boolean) => void,
] {
  const [isCompactGrid, setIsCompactGrid] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    setIsCompactGrid(
      window.localStorage.getItem(COMPACT_GRID_STORAGE_KEY) === "true",
    );
    setPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (preferenceLoaded) {
      window.localStorage.setItem(
        COMPACT_GRID_STORAGE_KEY,
        String(isCompactGrid),
      );
    }
  }, [preferenceLoaded, isCompactGrid]);

  return [isCompactGrid, setIsCompactGrid];
}
