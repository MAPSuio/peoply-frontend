import { User } from "../types/types";
import styles from "../styles/Avatar.module.scss";

interface UserProps {
  user: User;
}

export default function Avatar({ user }: UserProps) {
  console.log(user);
  return (
    <div>
      <div className={styles.avatar}>
        <span className={styles.name}>
          {`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}
        </span>
        <span className={styles.indicator}></span>
      </div>
    </div>
  );
}
