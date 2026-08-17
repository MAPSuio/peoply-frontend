import type { ReactNode } from "react";
import useSWR from "swr";

import useUser from "../../hooks/useUser";
import type { ArrangerFollower, Organization } from "../../types/types";
import { organizationPath } from "../../utils/organization";
import Link from "../Link";
import CalendarIconCard from "../svgs/CalendarIconCard";
import FollowIcon from "../svgs/FollowIcon";
import UsersIconCard from "../svgs/UsersIconCard";
import styles from "../../styles/Organization.module.scss";

interface StatTileProps {
  href: string;
  icon: ReactNode;
  value?: number;
  label: string;
}

function StatTile({ href, icon, value, label }: StatTileProps) {
  return (
    <Link href={href} className={styles.iconContainer}>
      {icon}
      <p className={styles.data}>{value}</p>
      <p className={styles.dataDescription}>{label}</p>
    </Link>
  );
}

export interface OrganizationStatsProps {
  organization: Organization;
  isAdminOrOwner?: boolean;
  memberCount?: number;
  eventCount?: number;
}

/** Members, followers and arrangements, each linking to its own list. */
export default function OrganizationStats({
  organization,
  isAdminOrOwner,
  memberCount,
  eventCount,
}: OrganizationStatsProps) {
  const { user } = useUser();

  const { data: followers } = useSWR<ArrangerFollower[]>(
    user && isAdminOrOwner
      ? `/organizations/${organization.id}/followers`
      : null,
  );

  return (
    <div className={styles.dataContainer}>
      {memberCount !== undefined && (
        <StatTile
          href={organizationPath(organization, "/members")}
          icon={
            <UsersIconCard className={`${styles.icon} ${styles.usersIcon}`} />
          }
          value={memberCount}
          label="Medlemmer"
        />
      )}
      {isAdminOrOwner && followers && (
        <StatTile
          href={organizationPath(organization, "/followers")}
          icon={
            <FollowIcon className={`${styles.icon} ${styles.followIcon}`} />
          }
          value={followers.length}
          label="Følgere"
        />
      )}
      <StatTile
        href={organizationPath(organization, "/events")}
        icon={<CalendarIconCard className={styles.icon} />}
        value={eventCount}
        label="Arrangementer"
      />
    </div>
  );
}
