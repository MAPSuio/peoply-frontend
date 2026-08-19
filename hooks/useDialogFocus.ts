import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/* Trap Tab inside the dialog - without this, focus walks out into the page
   behind the overlay, which is unreachable by mouse. */
function trapTab(event: KeyboardEvent, container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/* Focus handling shared by Modal and Sheet: move focus into the dialog, trap
   Tab inside it, close on Escape, and hand focus back to whatever opened it. */
export default function useDialogFocus(
  containerRef: RefObject<HTMLElement | null>,
  onClose?: () => void,
) {
  /* Keeps the close callback out of the effect's dependencies: callers pass an
     inline arrow, so a new identity on every render would re-run the effect and
     steal focus back mid-interaction. */
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    /* Move focus into the dialog so a keyboard or screen reader user lands on
       its content rather than staying behind it on the page. */
    const firstFocusable =
      container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (firstFocusable ?? container)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !container) {
        return;
      }

      trapTab(event, container);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [containerRef]);
}
