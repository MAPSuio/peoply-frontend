import type { Popup } from "../../types/types";
import { type PopupStatus, formatPopupRange } from "../../utils/popups";
import PopupDateRangeButton, {
  type PopupInterval,
} from "../PopupDateRangeButton";
import EditIcon from "../svgs/EditIcon";
import TrashIcon from "../svgs/TrashIcon";

import styles from "../../styles/PopupScheduler.module.scss";

export interface PopupCardProps {
  popup: Popup;
  variant: PopupStatus;
  onEdit: () => void;
  onChangeDates: (interval: PopupInterval) => Promise<void>;
  onDelete: () => void;
}

export default function PopupCard({
  popup,
  variant,
  onEdit,
  onChangeDates,
  onDelete,
}: PopupCardProps) {
  const past = variant === "past";

  return (
    <article
      className={`${styles.card} ${styles[variant]}`}
      aria-disabled={past}
    >
      <h3>{popup.title}</h3>
      <p className={styles.preview}>{popup.body}</p>
      <div className={styles.cardFooter}>
        <span className={styles.dateRange}>
          {formatPopupRange(popup.startsAt, popup.endsAt)}
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onEdit}
            disabled={past}
            aria-label="Rediger innhold"
          >
            <EditIcon />
          </button>
          <PopupDateRangeButton
            popup={popup}
            disabled={past}
            onChange={onChangeDates}
          />
          <button
            type="button"
            className={styles.delete}
            onClick={onDelete}
            disabled={past}
            aria-label="Slett"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}
