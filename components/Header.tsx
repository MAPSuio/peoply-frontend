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
        <Link href="/">
          <a className={styles.logo}>Peoply</a>
        </Link>
        {user ? (
          <div className={styles.loggedIn}>
            <NotificationIndicator
              hasUnreadNotifications={hasUnreadNotifications}
            />

            <Link href="/me" passHref>
              <a>
                <Avatar user={user} />
              </a>
            </Link>
          </div>
        ) : (
          <div className={styles.avatarContainer}>
            <Link href="/login">Log in</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        )}
      </div>
    </div>
  );
}
