import BellIcon from "./svgs/BellIcon";
import styles from "../styles/NotificationIndicator.module.scss";
import Link from "./Link";

interface NotificationIndicatorProps {
  hasUnreadNotifications: boolean;
}

export default function NotificationIndicator({
  hasUnreadNotifications,
}: NotificationIndicatorProps) {
  return (
    <Link href="/me/notifications" className={styles.container}>
      {hasUnreadNotifications && <div className={styles.counter} />}
      <BellIcon className={styles.icon} />
    </Link>
  );
}
