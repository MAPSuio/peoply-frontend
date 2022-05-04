import styles from "../styles/MemberCard.module.scss";
import { User } from "../types/types";
import Avatar from "./Avatar";
import ChevronRightIcon from "./svgs/ChevronRightIcon";

interface MemberCardProps {
  user: User;
}

export default function MemberCard({ user }: MemberCardProps) {
  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <Avatar size="medium" user={user} />
        <div className={styles.name}>
          <p>{`${user.firstName} ${user.lastName}`}</p>
          <p>Role</p>
        </div>
      </div>
      <ChevronRightIcon />
    </div>
  );
}
