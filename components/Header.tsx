// Next.js.
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "./Link";

// Components.
import Avatar from "./Avatar";
import NotificationIndicator from "./NotificationIndicator";
import NotificationsFeed from "./NotificationsFeed";
import ProfileOverview from "./ProfileOverview";
import Sheet from "./Sheet";
import LinkButton from "./LinkButton";
import LinkIcon from "./svgs/LinkIcon";
import { IconPlacement } from "./Button";

// Hooks.
import useUser from "../hooks/useUser";
import useNotifications from "../hooks/useNotifications";

// Types.
import { ButtonType } from "../types/types";

// Styles.
import styles from "../styles/Header.module.scss";

type OpenSheet = "notifications" | "profile" | null;

export default function Header() {
  const { user } = useUser();
  const { hasUnreadNotifications } = useNotifications();
  const [openSheet, setOpenSheet] = useState<OpenSheet>(null);
  const router = useRouter();

  /* Both sheets contain links. Without this the sheet stays up in front of the
     page it just navigated to, since the header itself never unmounts. */
  useEffect(() => {
    const closeSheet = () => setOpenSheet(null);

    router.events.on("routeChangeStart", closeSheet);

    return () => {
      router.events.off("routeChangeStart", closeSheet);
    };
  }, [router.events]);

  const toggleSheet = (sheet: Exclude<OpenSheet, null>) =>
    setOpenSheet((current) => (current === sheet ? null : sheet));

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Peoply
        </Link>
        <div className={styles.navLinks}>
          <LinkButton
            text="Feedback"
            href="/feedback"
            type={ButtonType.SECONDARY}
            className={styles.navButton}
            iconPlacement={IconPlacement.LEFT}
            width="fit-content"
            small
            noShadow
          />
          <LinkButton
            text="API"
            href="/integrasjoner"
            type={ButtonType.SECONDARY}
            className={`${styles.navButton} ${styles.apiButton}`}
            icon={<LinkIcon />}
            iconPlacement={IconPlacement.RIGHT}
            width="fit-content"
            small
            noShadow
          />
          <Link href="/faq">FAQ</Link>
        </div>
        {user ? (
          <div className={styles.loggedIn}>
            <NotificationIndicator
              hasUnreadNotifications={hasUnreadNotifications}
              onClick={() => toggleSheet("notifications")}
              isOpen={openSheet === "notifications"}
            />

            <button
              type="button"
              className={styles.avatarButton}
              onClick={() => toggleSheet("profile")}
              aria-label="Min profil"
              aria-haspopup="dialog"
              aria-expanded={openSheet === "profile"}
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
      {user && openSheet === "notifications" && (
        <Sheet label="Varsler" onClose={() => setOpenSheet(null)}>
          <NotificationsFeed />
        </Sheet>
      )}
      {user && openSheet === "profile" && (
        <Sheet label="Min profil" onClose={() => setOpenSheet(null)}>
          <ProfileOverview user={user} />
        </Sheet>
      )}
    </div>
  );
}
