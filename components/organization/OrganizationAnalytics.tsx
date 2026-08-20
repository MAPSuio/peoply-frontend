import dynamic from "next/dynamic";
import useSWR from "swr";

import { useIsDesktop } from "../../hooks/useMediaQuery";
import type {
  Organization,
  OrganizationAnalytics as OrganizationAnalyticsPayload,
} from "../../types/types";
import {
  bestTimeLabel,
  formatCount,
  formatDaysBefore,
  formatDelta,
  formatPercent,
} from "../../utils/analyticsFormat";
import Link from "../Link";
import QueryState from "../QueryState";
import styles from "../../styles/OrganizationAnalytics.module.scss";

/* The charts are desktop-only, so mobile clients never download them. jsdom
   cannot measure SVG either, which is why the boundary sits exactly here. */
const AnalyticsCharts = dynamic(() => import("./charts/AnalyticsCharts"), {
  ssr: false,
});

interface StatValueProps {
  value: string;
  label: string;
  delta?: number;
}

function StatValue({ value, label, delta }: StatValueProps) {
  return (
    <div className={styles.stat}>
      <p className={styles.value}>
        {value}
        {delta !== undefined && delta !== 0 && (
          <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>
            {formatDelta(delta)}
          </span>
        )}
      </p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}

export interface OrganizationAnalyticsProps {
  organization: Organization;
}

export default function OrganizationAnalytics({
  organization,
}: OrganizationAnalyticsProps) {
  const query = useSWR<OrganizationAnalyticsPayload>(
    `/organizations/${organization.id}/analytics`,
  );
  const isDesktop = useIsDesktop();

  return (
    <QueryState query={query}>
      {(analytics) => {
        const { followers, members, events, audience } = analytics;
        const topEvents = [...events.items]
          .sort((a, b) => b.goingCount - a.goingCount)
          .slice(0, 3);

        return (
          <div className={styles.container}>
            <p className={styles.scope}>Siste 12 måneder</p>
            <div className={styles.grid}>
              <StatValue
                value={formatCount(followers.total)}
                label="Følgere"
                delta={followers.net7d}
              />
              <StatValue
                value={formatCount(members.total)}
                label="Medlemmer"
                delta={members.new30d}
              />
              <StatValue
                value={formatCount(events.averageGoing)}
                label="Påmeldte per arrangement"
              />
              <StatValue
                value={formatPercent(events.soldOutRate)}
                label="Arrangementer som ble fulle"
              />
              <StatValue
                value={formatDaysBefore(events.medianSignupLeadDays)}
                label="Folk melder seg på"
              />
              <StatValue
                value={formatPercent(events.dropoutRate)}
                label="Melder seg av"
              />
              <StatValue
                value={formatPercent(audience.returningAttendeeRate)}
                label="Kommer igjen"
              />
              <StatValue
                value={formatCount(audience.coreAudienceCount)}
                label="Faste deltakere"
              />
              <StatValue
                value={formatPercent(audience.attendeeFollowerRate)}
                label="Deltakere som følger dere"
              />
              <StatValue
                value={bestTimeLabel(events.byWeekday, events.byTimeOfDay)}
                label="Beste tidspunkt"
              />
            </div>
            {isDesktop && <AnalyticsCharts analytics={analytics} />}
            {topEvents.length > 0 && (
              <ol className={styles.topEvents}>
                {topEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.urlId || event.id}`}
                      className={styles.topEvent}
                    >
                      <span className={styles.topEventTitle}>
                        {event.title}
                      </span>
                      <span className={styles.topEventCount}>
                        {event.goingCount}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        );
      }}
    </QueryState>
  );
}
