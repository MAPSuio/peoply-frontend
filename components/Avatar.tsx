import type { Organization, User, Event } from "../types/types";
import styles from "../styles/Avatar.module.scss";
import EditCircle from "./EditCircle";
import Image from "next/legacy/image";
import eventPlaceholderImage from "../assets/images/undraw_partying.png";
import { getEventImage } from "../utils/event";
import { type AvatarContent, getAvatarContent } from "../utils/avatar";

interface AvatarProps {
  user?: User;
  org?: Organization;
  event?: Event;
  size?: "small" | "medium" | "large";
  edit?: boolean;
}

export default function Avatar({ user, org, size, edit, event }: AvatarProps) {
  const sizeStyling = (() => {
    switch (size) {
      case "small":
        return styles.small;
      case "large":
        return styles.large;
      default:
        return styles.medium;
    }
  })();
  const imageSideLength = size === "small" ? 100 : 200;

  if (event) {
    return (
      <div>
        <div className={`${styles.avatar} ${sizeStyling}`}>
          <Image
            src={getEventImage(event) ?? eventPlaceholderImage}
            width={imageSideLength}
            height={imageSideLength}
            className={sizeStyling}
            alt={event.title}
          />
        </div>
      </div>
    );
  }

  const subject = org
    ? ({ type: "organization", organization: org } as const)
    : user
      ? ({ type: "user", user } as const)
      : null;

  if (!subject) return null;

  const content: AvatarContent = getAvatarContent(subject);

  return (
    <div>
      <div
        className={`${styles.avatar} ${sizeStyling} ${
          content.type === "image" ? "" : styles.default
        }`}
      >
        {content.type === "image" ? (
          <Image
            src={content.src}
            width={imageSideLength}
            height={imageSideLength}
            className={sizeStyling}
            alt={content.alt}
          />
        ) : (
          <span className={styles.name}>{content.text}</span>
        )}

        {edit && <EditCircle className={styles.edit} />}
      </div>
    </div>
  );
}
