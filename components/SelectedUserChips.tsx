import type { User } from "../types/types";
import CloseIcon from "./svgs/CloseIcon";

import styles from "../styles/InviteMembersToOrg.module.scss";

export interface SelectedUserChipsProps {
  users: User[];
  onRemove: (user: User) => void;
  closeIconClassName?: string;
}

export default function SelectedUserChips({
  users,
  onRemove,
  closeIconClassName,
}: SelectedUserChipsProps) {
  return (
    <div className={styles.selected}>
      {users.length > 0 && <p>Valgte brukere: </p>}
      {users.map((user) => (
        <button
          type="button"
          className={styles.selectedUser}
          key={user.id}
          onClick={() => onRemove(user)}
        >
          {`${user.firstName.slice(0, 1).toUpperCase()}. ${user.lastName}`}
          <CloseIcon className={closeIconClassName} />
        </button>
      ))}
    </div>
  );
}
