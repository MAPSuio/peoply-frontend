import type { Organization, User, Event } from "../types/types";
import styles from "../styles/Avatar.module.scss";
import EditCircle from "./EditCircle";
import Image from "next/legacy/image";
import eventPlaceholderImage from "../assets/images/undraw_partying.png";
import { getEventImage } from "../utils/event";

interface AvatarProps {
  user?: User;
  org?: Organization;
  event?: Event;
  size?: "small" | "medium" | "large";
  edit?: boolean; // whether or not to show edit icon
}

/* should get either user, org or event */
export default function Avatar({ user, org, size, edit, event }: AvatarProps) {
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

  if (event) {
    return (
      <div>
        <div
          className={`${styles.avatar} ${getSizeStyling()} ${
            event ? "" : styles.default
          }`}
        >
          <Image
            src={getEventImage(event) ?? eventPlaceholderImage}
            width={size === "small" ? "100" : "200"}
            height={size === "small" ? "100" : "200"}
            className={getSizeStyling()}
            alt={event.title}
          />
        </div>
      </div>
    );
  }

  if (org) {
    return (
      <div>
        <div
          className={`${styles.avatar} ${getSizeStyling()} ${
            org.image ? "" : styles.default
          }`}
        >
          {org.image ? (
            <Image
              src={org.image}
              width={size === "small" ? "100" : "200"}
              height={size === "small" ? "100" : "200"}
              className={getSizeStyling()}
              alt={org.name}
            />
          ) : (
            <span className={styles.name}>
              {`${org.name.charAt(0).toUpperCase()}`}
            </span>
          )}

          {edit && <EditCircle className={styles.edit} />}
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div>
        <div
          className={`${styles.avatar} ${getSizeStyling()} ${
            user.image ? "" : styles.default
          }`}
        >
          {user.image ? (
            <Image
              src={user.image}
              width={size === "small" ? 100 : 200}
              height={size === "small" ? 100 : 200}
              className={getSizeStyling()}
              alt={`profile image of ${user.firstName} ${user.lastName}`}
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

  return <></>;
}
