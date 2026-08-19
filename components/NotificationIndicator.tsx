import BellIcon from "./svgs/BellIcon";
import styles from "../styles/NotificationIndicator.module.scss";

export interface NotificationIndicatorProps {
  hasUnreadNotifications: boolean;
  onClick: () => void;
  isOpen: boolean;
}

export default function NotificationIndicator({
  hasUnreadNotifications,
  onClick,
  isOpen,
}: NotificationIndicatorProps) {
  return (
    <button
      type="button"
      className={styles.container}
      onClick={onClick}
      aria-label="Varsler"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
    >
      {hasUnreadNotifications && <div className={styles.counter} />}
      <BellIcon className={styles.icon} />
    </button>
  );
}
