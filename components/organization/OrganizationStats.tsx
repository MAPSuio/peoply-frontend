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
  /** Omitted when the list behind the tile is not this viewer's to open. */
  href?: string;
  icon: ReactNode;
  value?: number;
  label: string;
}

function StatTile({ href, icon, value, label }: StatTileProps) {
  const content = (
    <>
      {icon}
      <p className={styles.data}>{value}</p>
      <p className={styles.dataDescription}>{label}</p>
    </>
  );

  return href ? (
    <Link href={href} className={styles.iconContainer}>
      {content}
    </Link>
  ) : (
    <div className={styles.iconContainer}>{content}</div>
  );
}

export interface OrganizationStatsProps {
  organization: Organization;
  isMemberOfOrg?: boolean;
  isAdminOrOwner?: boolean;
  memberCount?: number;
  eventCount?: number;
}

/**
 * Members, followers and arrangements, each linking to its own list.
 *
 * The member count is a public aggregate, but the list behind it is members
 * only. Linking an outsider there sent them to a page that could only answer
 * 403 and bounce them back, so the count stays and the link does not.
 */
export default function OrganizationStats({
  organization,
  isMemberOfOrg,
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
          href={
            isMemberOfOrg
              ? organizationPath(organization, "/members")
              : undefined
          }
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
