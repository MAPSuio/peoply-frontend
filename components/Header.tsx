// Next.js.
import Link from "next/link";

// Components.
import Avatar from "./Avatar";
import NotificationIndicator from "./NotificationIndicator";
import LinkButton from "./LinkButton";
import GithubIcon from "./svgs/GithubIcon";
import LinkIcon from "./svgs/LinkIcon";
import { IconPlacement } from "./Button";

// Hooks.
import useUser from "../hooks/useUser";
import useNotifications from "../hooks/useNotifications";

// Types.
import { ButtonType } from "../types/types";

// Utils.
import { sourceCodeUrl } from "../utils/constants";

// Styles.
import styles from "../styles/Header.module.scss";

/**
 * `showSourceLink` is opt-in rather than always on: the source link belongs
 * next to the logo on the front page, where it reads as "this project is open
 * source", not on every page that happens to render a header.
 */
export default function Header({
  showSourceLink = false,
}: {
  showSourceLink?: boolean;
}) {
  const { user } = useUser();
  const { hasUnreadNotifications } = useNotifications();

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Peoply
        </Link>
        {showSourceLink && (
          <a
            href={sourceCodeUrl}
            className={styles.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Se kildekoden på GitHub"
            aria-label="Se kildekoden på GitHub"
          >
            <GithubIcon />
          </a>
        )}
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
