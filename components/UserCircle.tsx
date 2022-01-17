import styles from "../styles/UserCircle.module.scss";

import UserIcon from "./svgs/UserIcon";

export default function UserCircle() {
  return (
    <div className={styles.container}>
      <UserIcon />
    </div>
  );
}
