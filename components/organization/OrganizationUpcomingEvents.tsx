import type { Event, Organization } from "../../types/types";
import { organizationPath } from "../../utils/organization";
import LargeEventCard from "../LargeEventCard";
import Link from "../Link";
import styles from "../../styles/Organization.module.scss";

export interface OrganizationUpcomingEventsProps {
  organization: Organization;
  events?: Event[];
}

export default function OrganizationUpcomingEvents({
  organization,
  events,
}: OrganizationUpcomingEventsProps) {
  return (
    <div className={styles.eventWrapper}>
      <div className={styles.eventHeaderContainer}>
        <h2 className={styles.eventHeader}>Kommende arrangementer</h2>
        <Link
          href={organizationPath(organization, "/events")}
          className={styles.link}
        >
          Se alle
        </Link>
      </div>
      <div className={styles.eventContainer}>
        {events?.map((event) => (
          <LargeEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
