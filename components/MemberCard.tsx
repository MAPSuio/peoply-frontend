import Link from "next/link";
import styles from "../styles/MemberCard.module.scss";
import { User } from "../types/types";
import Avatar from "./Avatar";

interface MemberCardProps {
  user: User;
  description?: string;
  icon?: JSX.Element;
  iconOnClick?: () => void;
}

export default function MemberCard({
  user,
  description,
  icon,
  iconOnClick: onClick,
}: MemberCardProps) {
  return (
    <div className={styles.container}>
      <Link href={`/users/${user.id}`} passHref>
        <a>
          <div className={styles.info}>
            <Avatar size="medium" user={user} />
            <div className={styles.nameAndDescription}>
              <p
                className={styles.name}
              >{`${user.firstName} ${user.lastName}`}</p>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
          </div>
        </a>
      </Link>
      {icon && (
        <button className={styles.icon} onClick={onClick}>
          {icon}
        </button>
      )}
    </div>
  );
}
