import Link from "next/link";
import { ReactElement } from "react";
import styles from "../styles/MemberCard.module.scss";
import { User } from "../types/types";
import Avatar from "./Avatar";

interface MemberCardProps {
  user: User;
  description?: string;
  icon?: ReactElement;
  iconOnClick?: () => void;
  comment?: string;
}

export default function MemberCard({
  user,
  description,
  icon,
  iconOnClick: onClick,
  comment,
}: MemberCardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Link href={`/users/${user.id}`}>
          <div className={styles.info}>
            <Avatar size="medium" user={user} />
            <div className={styles.nameAndDescription}>
              <div className={styles.name}>
                <p>{`${user.firstName} ${user.lastName}`}</p>
              </div>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
          </div>
        </Link>
        {icon && (
          <button className={styles.icon} onClick={onClick}>
            {icon}
          </button>
        )}
      </div>
      {comment && (
        <div className={styles.comment}>
          {comment.split("\n").map((str) => (
            <p key={str}>
              {str}
              <br></br>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
