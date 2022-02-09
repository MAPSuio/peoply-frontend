import { User } from "../types/types";
import styles from "../styles/Avatar.module.scss";

interface UserProps {
  user: User;
  size?: "small" | "medium" | "large";
}

export default function Avatar({ user, size }: UserProps) {
  const getSizeStyling = () => {
    switch (size) {
      case "small":
        return styles.small;
      case "medium":
        return styles.medium;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  };
  return (
    <div>
      <div className={`${styles.avatar} ${getSizeStyling()}`}>
        <span className={styles.name}>
          {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
        </span>
      </div>
    </div>
  );
}
