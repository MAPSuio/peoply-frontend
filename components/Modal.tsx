import { type ReactNode, useId, useRef } from "react";

/* Hooks */
import useDialogFocus from "../hooks/useDialogFocus";

/* Styles */
import styles from "../styles/Modal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  closeButtonOnClick?: () => void;
  children?: ReactNode;
}

const Modal = ({
  label,
  description,
  closeButtonOnClick,
  children,
}: ModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useDialogFocus(containerRef, closeButtonOnClick);

  const closeClickFunction = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    closeButtonOnClick?.();
  };

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
