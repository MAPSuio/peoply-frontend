// Components.
import Avatar from "./Avatar";
import ProfileMenu from "./ProfileMenu";

// Types.
import type { User } from "../types/types";

// Utils.
import { injectLink } from "../utils/functions";

// Styles.
import styles from "../styles/ProfileOverview.module.scss";

interface ProfileOverviewProps {
  user: User;
}

/* Profile picture, name, description and the profile menu. Rendered both as
   the /me page and inside the sheet the avatar in the header opens. */
export default function ProfileOverview({ user }: ProfileOverviewProps) {
  return (
    <div className={styles.container}>
      <div className={styles.profile}>
        <Avatar user={user} size="large" />
        <h1 className={styles.name}>{`${user.firstName} ${user.lastName}`}</h1>
        <p className={styles.description}>
          {injectLink(user.description ?? "")}
        </p>
      </div>
      <ProfileMenu />
    </div>
  );
}
