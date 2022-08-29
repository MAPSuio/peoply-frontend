import styles from "../styles/UserCircle.module.scss";

import UserIcon from "./svgs/UserIcon";

interface UserCircleProps {
  large?: boolean;
}

export default function UserCircle({ large }: UserCircleProps) {
  return (
    <div className={`${styles.container} ${large ? styles.large : ""}`}>
      <UserIcon />
    </div>
  );
}
