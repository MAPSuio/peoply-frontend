const BACKGROUND_PATTERN_STORAGE_KEY = "backgroundPatternEnabled";
export const BACKGROUND_PATTERN_EVENT = "background-pattern-preference-change";

export function getBackgroundPatternEnabled() {
  if (typeof window === "undefined") {
    return true;
  }

  try {
    return (
      window.localStorage.getItem(BACKGROUND_PATTERN_STORAGE_KEY) !== "false"
    );
  } catch {
    return true;
  }
}

export function setBackgroundPatternEnabled(enabled: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      BACKGROUND_PATTERN_STORAGE_KEY,
      String(enabled),
    );
  } catch {
    // Ignore storage failures and still update the current session.
  }

  try {
    window.dispatchEvent(
      new CustomEvent(BACKGROUND_PATTERN_EVENT, { detail: enabled }),
    );
  } catch {
    // Ignore dispatch failures so preference toggles stay non-blocking.
  }
}
