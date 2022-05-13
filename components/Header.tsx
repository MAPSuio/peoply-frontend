// Next.js.
import Link from "next/link";

// React.
import { useState } from "react";

// Components.
import Avatar from "./Avatar";
import ChevronDownIcon from "./svgs/ChevronDownIcon";
import MenuModal from "./MenuModal";
import ChangeContextMenu from "./ChangeContextMenu";
import NotificationIndicator from "./NotificationIndicator";

// Hooks.
import useUser from "../hooks/useUser";
import useNotifications from "../hooks/useNotifications";

// Styles.
import styles from "../styles/Header.module.scss";

export default function Header() {
  const { user, currentOrg, orgs } = useUser();
  const [changeContext, setChangeContext] = useState(false);
  const { notifications, hasUnreadNotifications } = useNotifications();

  const userHasOrgs = orgs && orgs.length > 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <Link href="/">
          <a className={styles.logo}>Peoply</a>
        </Link>
        {user ? (
          <div className={styles.loggedIn}>
            {notifications && !currentOrg && (
              <NotificationIndicator
                hasUnreadNotifications={hasUnreadNotifications}
              />
            )}
            {userHasOrgs && (
              <button onClick={() => setChangeContext(!changeContext)}>
                <ChevronDownIcon />
              </button>
            )}
            <Link href="/me" passHref>
              <a>
                <Avatar user={user} org={currentOrg} />
              </a>
            </Link>
          </div>
        ) : (
          <div className={styles.avatarContainer}>
            <Link href="/login">Log in</Link>
            <Link href="/support">FAQ</Link>
          </div>
        )}
        {changeContext && (
          <MenuModal
            label="Endre bruker"
            onClose={() => setChangeContext(false)}
          >
            <ChangeContextMenu onClose={() => setChangeContext(false)} />
          </MenuModal>
        )}
      </div>
    </div>
  );
}
