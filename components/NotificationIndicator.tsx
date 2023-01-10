import BellIcon from "./svgs/BellIcon";
import styles from "../styles/NotificationIndicator.module.scss";
import Link from "next/link";

interface NotificationIndicatorProps {
  hasUnreadNotifications: boolean;
}

export default function NotificationIndicator({
  hasUnreadNotifications,
}: NotificationIndicatorProps) {
  return (
    <Link href="/me/notifications" passHref>
      <a className={styles.container}>
        {hasUnreadNotifications && <div className={styles.counter} />}
        <BellIcon className={styles.icon} />
      </a>
    </Link>
  );
}
