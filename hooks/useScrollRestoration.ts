import { useLayoutEffect, useRef } from "react";

/**
 * Module-level, not state: a `ScrollRow` unmounts and remounts on every SPA
 * navigation (leaving "/" for /events, coming back), so anything kept in
 * React state or the DOM itself is gone by the time the row reappears. This
 * map outlives that remount because the module does - it only resets on an
 * actual page reload, which is exactly when starting over is expected.
 */
const scrollPositions = new Map<string, number>();

/**
 * Restores a horizontally scrollable row to wherever the user left it the
 * last time this `key` mounted, and keeps that position updated as they
 * scroll. Pass a stable, unique key per row (e.g. "home-upcoming-events");
 * rows without a key are left as plain scroll containers.
 */
export default function useScrollRestoration<T extends HTMLElement>(
  key: string | undefined,
) {
  const ref = useRef<T>(null);

  // useLayoutEffect, not useEffect: sets scrollLeft before the browser paints
  // the remounted row, so the user never sees it flash at position 0.
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !key) return;

    const storedPosition = scrollPositions.get(key);
    if (storedPosition !== undefined) {
      node.scrollLeft = storedPosition;
    }

    // rAF-throttled: a fling fires far more `scroll` events than the display
    // has frames, and writing to the map on every single one of them was
    // competing with the browser's own scroll compositing for main-thread
    // time. Collapsing it to at most once per frame is what made scrolling
    // feel less smooth than before this hook existed.
    let frame: number | null = null;
    const handleScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        scrollPositions.set(key, node.scrollLeft);
      });
    };

    node.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", handleScroll);
      // Flush rather than drop: navigating away (the whole point of this
      // hook) unmounts the row well within a frame of the last scroll event,
      // so a bare cancel would throw away the one position that matters most.
      if (frame !== null) {
        cancelAnimationFrame(frame);
        scrollPositions.set(key, node.scrollLeft);
      }
    };
  }, [key]);

  return ref;
}
