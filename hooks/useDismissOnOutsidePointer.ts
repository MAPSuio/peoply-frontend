import { type RefObject, useEffect, useRef } from "react";

export default function useDismissOnOutsidePointer(
  containerRef: RefObject<HTMLElement | null>,
  onDismiss: () => void,
): void {
  const latestOnDismiss = useRef(onDismiss);
  latestOnDismiss.current = onDismiss;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const container = containerRef.current;

      if (
        container &&
        event.target instanceof Node &&
        !container.contains(event.target)
      ) {
        latestOnDismiss.current();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [containerRef]);
}
