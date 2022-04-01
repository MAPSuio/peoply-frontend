import { User } from "../types/types";
import styles from "../styles/Avatar.module.scss";
import EditCircle from "./EditCircle";
import Image from "next/image";

interface UserProps {
  user: User;
  size?: "small" | "medium" | "large";
  edit?: boolean; // whether or not to show edit icon
}

export default function Avatar({ user, size, edit }: UserProps) {
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
      <div
        className={`${styles.avatar} ${getSizeStyling()} ${
          user.image ? "" : styles.default
        }`}
      >
        {user.image ? (
          <Image
            layout="fill"
            src={user.image}
            alt="profile picture"
            sizes="35vw"
            quality={50}
          />
        ) : (
          <span className={styles.name}>
            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
          </span>
        )}
        {edit && <EditCircle className={styles.edit} />}
      </div>
    </div>
  );
}
