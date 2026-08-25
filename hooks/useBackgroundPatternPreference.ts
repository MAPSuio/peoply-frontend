import { useCallback, useEffect, useState } from "react";

import {
  BACKGROUND_PATTERN_EVENT,
  getBackgroundPatternEnabled,
  setBackgroundPatternEnabled,
} from "../utils/backgroundPattern";

/**
 * The single way to read and write the background pattern preference.
 *
 * Every consumer starts at `false`, which is what a server with no storage
 * renders, and catches up after mount. Reading the stored value while
 * rendering would make the first client pass disagree with the server.
 */
export default function useBackgroundPatternPreference(): [
  boolean,
  (enabled: boolean) => void,
] {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const readPreference = () => setEnabled(getBackgroundPatternEnabled());

    const handlePreferenceChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "boolean") {
        setEnabled(event.detail);
        return;
      }

      readPreference();
    };

    readPreference();
    window.addEventListener(BACKGROUND_PATTERN_EVENT, handlePreferenceChange);
    window.addEventListener("storage", readPreference);

    return () => {
      window.removeEventListener(
        BACKGROUND_PATTERN_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener("storage", readPreference);
    };
  }, []);

  /* Writing dispatches the event this hook listens to, so every other
     consumer updates without threading state through the tree. */
  const updatePreference = useCallback((next: boolean) => {
    setBackgroundPatternEnabled(next);
  }, []);

  return [enabled, updatePreference];
}
