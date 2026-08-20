import dynamic from "next/dynamic";
import { useState } from "react";
import useSWR from "swr";

import { useIsDesktop } from "../../hooks/useMediaQuery";
import type {
  AnalyticsPeriod,
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
import Dropdown from "../Dropdown";
import Link from "../Link";
import QueryState from "../QueryState";
import styles from "../../styles/OrganizationAnalytics.module.scss";

/* The charts are desktop-only, so mobile clients never download them. jsdom
   cannot measure SVG either, which is why the boundary sits exactly here. */
const AnalyticsCharts = dynamic(() => import("./charts/AnalyticsCharts"), {
  ssr: false,
});

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "24h", label: "Siste 24 timer" },
  { value: "7d", label: "Siste 7 dager" },
  { value: "30d", label: "Siste måned" },
  { value: "90d", label: "Siste 3 måneder" },
  { value: "1y", label: "Siste år" },
];

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
  const [period, setPeriod] = useState<AnalyticsPeriod>("1y");
  const query = useSWR<OrganizationAnalyticsPayload>(
    `/organizations/${organization.id}/analytics?period=${period}`,
    { keepPreviousData: true },
  );
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.container}>
      <Dropdown
        options={PERIOD_OPTIONS}
        value={period}
        setValue={setPeriod}
        inputId="analytics-period"
        className={styles.periodPicker}
      />
      <QueryState query={query}>
        {(analytics) => {
          const { followers, members, events, audience } = analytics;
          const topEvents = [...events.items]
            .sort((a, b) => b.goingCount - a.goingCount)
            .slice(0, 3);

          return (
            <>
              <div className={styles.grid}>
                <StatValue
                  value={formatCount(followers.total)}
                  label="Følgere"
                  delta={followers.netPeriod}
                />
                <StatValue
                  value={formatCount(members.total)}
                  label="Medlemmer"
                  delta={members.newInPeriod}
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
                <section>
                  <h2 className={styles.chartTitle}>Mest populære</h2>
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
                            {event.goingCount} påmeldte
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          );
        }}
      </QueryState>
    </div>
  );
}
