import { type ReactNode, useEffect, useId, useRef } from "react";

/* Hooks */
import useDialogFocus from "../hooks/useDialogFocus";

/* Styles */
import styles from "../styles/Sheet.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface SheetProps {
  label: string;
  onClose: () => void;
  children?: ReactNode;
}

/* A dialog that slides up from the bottom edge on a phone and hangs under the
   header as a panel on desktop - the shape a native app uses for the things
   you open from the top bar and dismiss again without leaving the page. */
const Sheet = ({ label, onClose, children }: SheetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogFocus(containerRef, onClose);

  /* The page behind the sheet must not scroll: the sheet covers most of a
     phone viewport, and a swipe that starts on it otherwise drags the feed
     underneath instead of the sheet's own content. */
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
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
        onClick={onClose}
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
        <div className={styles.grabber} aria-hidden="true" />
        <div className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {label}
          </h2>
          <button
            type="button"
            className={styles.exitIcon}
            onClick={onClose}
            aria-label="Lukk"
          >
            <ExitIcon />
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Sheet;
