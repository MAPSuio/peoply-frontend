// Next.js.
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "./Link";

// Components.
import Avatar from "./Avatar";
import NotificationIndicator from "./NotificationIndicator";
import NotificationsFeed from "./NotificationsFeed";
import ProfileOverview from "./ProfileOverview";
import Popover from "./Popover";

// Hooks.
import useUser from "../hooks/useUser";
import useNotifications from "../hooks/useNotifications";

// Styles.
import styles from "../styles/Header.module.scss";

type OpenPopover = "notifications" | "profile" | null;

export default function Header() {
  const { user } = useUser();
  const { hasUnreadNotifications } = useNotifications();
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const router = useRouter();

  /* Both panels contain links. Without this the panel stays open over the page
     it just navigated to, since the header itself never unmounts. */
  useEffect(() => {
    const closePopover = () => setOpenPopover(null);

    router.events.on("routeChangeStart", closePopover);

    return () => {
      router.events.off("routeChangeStart", closePopover);
    };
  }, [router.events]);

  const togglePopover = (popover: Exclude<OpenPopover, null>) =>
    setOpenPopover((current) => (current === popover ? null : popover));

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Peoply
        </Link>
        {user ? (
          <div className={styles.loggedIn}>
            <NotificationIndicator
              hasUnreadNotifications={hasUnreadNotifications}
              onClick={() => togglePopover("notifications")}
              isOpen={openPopover === "notifications"}
            />

            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => togglePopover("profile")}
              aria-label="Min profil"
              aria-haspopup="dialog"
              aria-expanded={openPopover === "profile"}
            >
              <Avatar user={user} />
            </button>
          </div>
        ) : (
          <div className={styles.avatarContainer}>
            <Link href="/login">Logg in</Link>
          </div>
        )}
      </div>
      {user && openPopover === "notifications" && (
        <Popover label="Varsler" onClose={() => setOpenPopover(null)}>
          <NotificationsFeed />
        </Popover>
      )}
      {user && openPopover === "profile" && (
        <Popover label="Min profil" onClose={() => setOpenPopover(null)}>
          <ProfileOverview user={user} />
        </Popover>
      )}
    </div>
  );
}
