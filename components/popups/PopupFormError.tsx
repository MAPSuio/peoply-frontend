import { type PopupConflict, formatPopupRange } from "../../utils/popups";

import styles from "../../styles/PopupScheduler.module.scss";

export interface PopupFormErrorProps {
  message: string;
  conflict?: PopupConflict;
}

export default function PopupFormError({
  message,
  conflict,
}: PopupFormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={styles.formError} role="alert">
      <p>{message}</p>
      {conflict && (
        <p className={styles.conflictRange}>
          {`«${conflict.title}» opptar ${formatPopupRange(
            conflict.startsAt,
            conflict.endsAt,
          )}`}
        </p>
      )}
    </div>
  );
}
