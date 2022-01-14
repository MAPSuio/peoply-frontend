import styles from "../styles/UserCircle.module.scss";

import UserIcon from "./icons/UserIcon";

export default function UserCircle() {
  return (
    <div className={styles.container}>
      <UserIcon />
    </div>
  );
}
