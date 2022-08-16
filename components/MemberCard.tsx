import Link from "next/link";
import styles from "../styles/MemberCard.module.scss";
import { User } from "../types/types";
import Avatar from "./Avatar";
import ChevronRightIcon from "./svgs/ChevronRightIcon";

interface MemberCardProps {
  user: User;
  description?: string;
  link?: string;
}

export default function MemberCard({
  user,
  link,
  description,
}: MemberCardProps) {
  return (
    <div className={styles.container}>
      <Link href={`/user/${user.id}`} passHref>
        <a>
          <div className={styles.info}>
            <Avatar size="medium" user={user} />
            <div className={styles.name}>
              <p>{`${user.firstName} ${user.lastName}`}</p>
              {description && (
                <p className={styles.description}>{description}</p>
              )}
            </div>
          </div>
        </a>
      </Link>
      {link && (
        <Link href={link} passHref>
          <a>
            <ChevronRightIcon />
          </a>
        </Link>
      )}
    </div>
  );
}
