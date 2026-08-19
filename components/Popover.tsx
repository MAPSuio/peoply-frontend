import { type ReactNode, useId, useRef } from "react";

/* Hooks */
import useDialogFocus from "../hooks/useDialogFocus";

/* Styles */
import styles from "../styles/Popover.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface PopoverProps {
  label: string;
  onClose: () => void;
  children?: ReactNode;
}

/* A panel hanging under the header icon that opened it, in the top right
   corner. Deliberately not a modal: notifications and the profile menu are
   things you glance at and dismiss, so the page behind stays lit, readable and
   scrollable rather than being taken over by a dialog in the middle of it. */
const Popover = ({ label, onClose, children }: PopoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogFocus(containerRef, onClose);

  return (
    <>
      {/* Click-outside-to-close as a real button rather than a handler on a
          div: a div with onClick is invisible to keyboard and assistive tech.
          Escape covers the keyboard path, so this is hidden from both. It
          catches the click without painting anything over the page. */}
      <button
        type="button"
        className={styles.clickCatcher}
        onClick={onClose}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        className={styles.container}
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
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
    </>
  );
};

export default Popover;
