import { useCallback, useSyncExternalStore } from "react";

/* Same breakpoint as the `desktop()` SCSS mixin and EventCalendar's
   DESKTOP_QUERY, so JS and CSS agree on what "desktop" means. */
const DESKTOP_QUERY = "(min-width: 600px)";

/**
 * Whether a CSS media query currently matches, hydration-safe: the server
 * snapshot is `false`, so SSR/ISR always renders the mobile branch and
 * desktop clients upgrade after hydration without a markup mismatch.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsDesktop(): boolean {
  return useMediaQuery(DESKTOP_QUERY);
}
