import { type ReactNode, useEffect, useId, useRef } from "react";

/* Styles */
import styles from "../styles/Modal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  closeButtonOnClick?: () => void;
  children?: ReactNode;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const Modal = ({
  label,
  description,
  closeButtonOnClick,
  children,
}: ModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const closeClickFunction = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    closeButtonOnClick?.();
  };

  /* Keeps the close callback out of the focus effect's dependencies: callers
     pass an inline arrow, so a new identity on every render would re-run the
     effect and steal focus back mid-interaction. */
  const closeRef = useRef(closeButtonOnClick);
  closeRef.current = closeButtonOnClick;

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

      /* Trap Tab inside the dialog - without this, focus walks out into the
         page behind the overlay, which is unreachable by mouse. */
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
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* Click-outside-to-close as a real button rather than a handler on the
          overlay div: a div with onClick is invisible to keyboard and assistive
          tech. Escape covers the keyboard path, so this is hidden from both. */}
      <button
        type="button"
        className={styles.backdrop}
        onClick={closeClickFunction}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className={styles.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          type="button"
          className={styles.exitIcon}
          onClick={closeClickFunction}
          aria-label="Lukk"
        >
          <ExitIcon />
        </button>
        <h1 className={styles.title} id={titleId}>
          {label}
        </h1>
        <div className={styles.descriptionContainer}>
          {description?.split("\n").map((str, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: lines come from a fixed string split, never reordered/added independently.
            <p className={styles.description} key={index}>
              {str}
              <br></br>
            </p>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
