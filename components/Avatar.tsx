import Image from "next/legacy/image";
import eventPlaceholderImage from "../assets/images/undraw_partying.png";
import styles from "../styles/Avatar.module.scss";
import type { Event, Organization, User } from "../types/types";
import {
  type AvatarContent,
  type AvatarSubject,
  getAvatarContent,
} from "../utils/avatar";
import { getEventImage } from "../utils/event";
import EditCircle from "./EditCircle";
import Mascot from "./Mascot";

export type AvatarSize = "small" | "medium" | "large";

export interface AvatarProps {
  user?: User;
  org?: Organization;
  event?: Event;
  size?: AvatarSize;
  edit?: boolean;
}

const sizeClassName: Record<AvatarSize, string> = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

const imageSideLength: Record<AvatarSize, number> = {
  small: 100,
  medium: 200,
  large: 200,
};

function toAvatarSubject(
  user: User | undefined,
  org: Organization | undefined,
): AvatarSubject | null {
  if (org) return { type: "organization", organization: org };
  if (user) return { type: "user", user };
  return null;
}

function AvatarFrame({
  size,
  isDefaultBackground,
  children,
}: {
  size: AvatarSize;
  isDefaultBackground?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={`${styles.avatar} ${sizeClassName[size]} ${
          isDefaultBackground ? styles.default : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function AvatarContentView({
  content,
  size,
}: {
  content: AvatarContent;
  size: AvatarSize;
}) {
  if (content.type === "image") {
    return (
      <Image
        src={content.src}
        width={imageSideLength[size]}
        height={imageSideLength[size]}
        className={sizeClassName[size]}
        alt={content.alt}
      />
    );
  }

  if (content.type === "mascot") {
    return <Mascot seed={content.seed} className={sizeClassName[size]} />;
  }

  return <span className={styles.name}>{content.text}</span>;
}

function EventAvatar({ event, size }: { event: Event; size: AvatarSize }) {
  return (
    <AvatarFrame size={size}>
      <Image
        src={getEventImage(event) ?? eventPlaceholderImage}
        width={imageSideLength[size]}
        height={imageSideLength[size]}
        className={sizeClassName[size]}
        alt={event.title}
      />
    </AvatarFrame>
  );
}

export default function Avatar({
  user,
  org,
  size = "medium",
  edit,
  event,
}: AvatarProps) {
  if (event) return <EventAvatar event={event} size={size} />;

  const subject = toAvatarSubject(user, org);
  if (!subject) return null;

  const content = getAvatarContent(subject);

  return (
    <AvatarFrame size={size} isDefaultBackground={content.type === "initials"}>
      <AvatarContentView content={content} size={size} />
      {edit && <EditCircle className={styles.edit} />}
    </AvatarFrame>
  );
}
