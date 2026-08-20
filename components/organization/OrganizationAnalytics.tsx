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
  formatDays,
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

interface OrganizationAnalyticsProps {
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
                label="Snittoppmøte"
              />
              <StatValue
                value={formatPercent(events.averageFillRate)}
                label="Fyllingsgrad"
              />
              <StatValue
                value={formatPercent(events.soldOutRate)}
                label="Utsolgt"
              />
              <StatValue
                value={formatCount(events.totalWaitlisted)}
                label="Venteliste"
              />
              <StatValue
                value={formatDays(events.medianSignupLeadDays)}
                label="Påmeldingstid"
              />
              <StatValue
                value={formatPercent(events.dropoutRate)}
                label="Frafall"
              />
              <StatValue
                value={formatPercent(audience.returningAttendeeRate)}
                label="Gjengangere"
              />
              <StatValue
                value={formatCount(audience.coreAudienceCount)}
                label="Kjernepublikum"
              />
              <StatValue
                value={formatPercent(audience.attendeeFollowerRate)}
                label="Konvertering"
              />
              <StatValue
                value={bestTimeLabel(events.byWeekday, events.byTimeOfDay)}
                label="Beste dag"
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
