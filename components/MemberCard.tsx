import Link from "next/link";
import styles from "../styles/MemberCard.module.scss";
import { UserOrganizationRoles } from "../types/types";
import Avatar from "./Avatar";
import ChevronRightIcon from "./svgs/ChevronRightIcon";

interface MemberCardProps {
  organizationUser: UserOrganizationRoles;
  link?: string;
}

export default function MemberCard({
  organizationUser,
  link,
}: MemberCardProps) {
  return (
    <div className={styles.container}>
      <Link href={`/user/${organizationUser.user.id}`} passHref>
        <a>
          <div className={styles.info}>
            <Avatar size="medium" user={organizationUser.user} />
            <div className={styles.name}>
              <p>{`${organizationUser.user.firstName} ${organizationUser.user.lastName}`}</p>
              <p>{organizationUser.roleDescription}</p>
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
