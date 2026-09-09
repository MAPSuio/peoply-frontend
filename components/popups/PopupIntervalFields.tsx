import styles from "../../styles/PopupScheduler.module.scss";

export interface PopupIntervalFieldsProps {
  startsAt: string;
  endsAt: string;
  onStartsAtChange: (startsAt: string) => void;
  onEndsAtChange: (endsAt: string) => void;
}

export default function PopupIntervalFields({
  startsAt,
  endsAt,
  onStartsAtChange,
  onEndsAtChange,
}: PopupIntervalFieldsProps) {
  return (
    <div className={styles.dateGrid}>
      <label className={styles.label} htmlFor="popup-start">
        Starter
        <input
          id="popup-start"
          className={styles.input}
          type="datetime-local"
          value={startsAt}
          onChange={(event) => onStartsAtChange(event.target.value)}
        />
      </label>
      <label className={styles.label} htmlFor="popup-end">
        Slutter
        <input
          id="popup-end"
          className={styles.input}
          type="datetime-local"
          value={endsAt}
          onChange={(event) => onEndsAtChange(event.target.value)}
        />
      </label>
    </div>
  );
}
