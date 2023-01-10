import UserIcon from "./svgs/UserIcon";

import styles from "../styles/UserCircle.module.scss";

interface UserCircleProps {
  large?: boolean;
  className?: string;
}

export default function UserCircle({ large, className }: UserCircleProps) {
  return (
    <div className={`${styles.container} ${large && styles.large}`}>
      <UserIcon className={className} />
    </div>
  );
}
