// Next.js.
import Link from "next/link";

// Components.
import Avatar from "./Avatar";
import NotificationIndicator from "./NotificationIndicator";

// Hooks.
import useUser from "../hooks/useUser";
import useNotifications from "../hooks/useNotifications";

// Styles.
import styles from "../styles/Header.module.scss";

export default function Header() {
  const { user } = useUser();
  const { hasUnreadNotifications } = useNotifications();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Peoply
        </Link>
        <div className={styles.navLinks}>
          <Link href="/feedback" className={styles.feedbackLink}>
            <span>Gi feedback</span>
          </Link>
          <Link href="/integrasjoner" className={styles.integrationsLink}>
            Integrasjoner
          </Link>
          <Link href="/faq">FAQ</Link>
        </div>
        {user ? (
          <div className={styles.loggedIn}>
            <NotificationIndicator
              hasUnreadNotifications={hasUnreadNotifications}
            />

            <Link href="/me">
              <Avatar user={user} />
            </Link>
          </div>
        ) : (
          <div className={styles.avatarContainer}>
            <Link href="/login">Logg in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
