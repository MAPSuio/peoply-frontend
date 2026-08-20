import { useMemo } from "react";
import { barY, defineChart, lineY, stack } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";

import type { OrganizationAnalytics } from "../../../types/types";
import { weekdayLabel } from "../../../utils/analyticsFormat";
import styles from "../../../styles/OrganizationAnalytics.module.scss";

const GOING_SERIES = "Påmeldt";
const WAITLIST_SERIES = "Venteliste";

const shortDate = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
});

interface AttendanceRow {
  event: string;
  series: string;
  count: number;
}

function AttendanceChart({ analytics }: { analytics: OrganizationAnalytics }) {
  const definition = useMemo(() => {
    const rows: AttendanceRow[] = analytics.events.items.flatMap((item) => {
      const event = shortDate.format(new Date(item.startDate));
      return [
        { event, series: GOING_SERIES, count: item.goingCount },
        { event, series: WAITLIST_SERIES, count: item.waitlistedCount },
      ];
    });

    return defineChart({
      marks: [
        barY(rows, {
          x: "event",
          y: "count",
          color: "series",
          layout: stack({ order: [GOING_SERIES, WAITLIST_SERIES] }),
        }),
      ],
      x: { scale: () => scaleBand<string>().padding(0.25) },
      y: { scale: scaleLinear, nice: true, grid: true },
      color: { domain: [GOING_SERIES, WAITLIST_SERIES] },
      tooltip,
    });
  }, [analytics]);

  return (
    <figure className={styles.chartCard}>
      <h2 className={styles.chartTitle}>Oppmøte</h2>
      <Chart
        definition={definition}
        height={220}
        ariaLabel="Påmeldte og venteliste per arrangement siste tolv måneder"
      />
    </figure>
  );
}

interface FollowerRow {
  date: string;
  total: number;
}

function FollowerChart({ analytics }: { analytics: OrganizationAnalytics }) {
  const definition = useMemo(() => {
    let total = 0;
    const rows: FollowerRow[] = analytics.followers.dailyNet.map((day) => {
      total += day.net;
      return { date: shortDate.format(new Date(day.date)), total };
    });

    return defineChart({
      marks: [lineY(rows, { x: "date", y: "total", strokeWidth: 2 })],
      x: { scale: () => scalePoint<string>().padding(0.1) },
      y: { scale: scaleLinear, nice: true, grid: true },
      tooltip,
    });
  }, [analytics]);

  return (
    <figure className={styles.chartCard}>
      <h2 className={styles.chartTitle}>Følgere · 30 d</h2>
      <Chart
        definition={definition}
        height={220}
        ariaLabel="Netto følgerutvikling siste tretti dager"
      />
    </figure>
  );
}

interface WeekdayRow {
  day: string;
  average: number;
}

function WeekdayChart({ analytics }: { analytics: OrganizationAnalytics }) {
  const definition = useMemo(() => {
    const rows: WeekdayRow[] = analytics.events.byWeekday.map((bucket) => ({
      day: weekdayLabel(bucket.weekday),
      average: bucket.averageGoing,
    }));

    return defineChart({
      marks: [barY(rows, { x: "day", y: "average" })],
      x: { scale: () => scaleBand<string>().padding(0.25) },
      y: { scale: scaleLinear, nice: true, grid: true },
      tooltip,
    });
  }, [analytics]);

  return (
    <figure className={styles.chartCard}>
      <h2 className={styles.chartTitle}>Ukedag</h2>
      <Chart
        definition={definition}
        height={220}
        ariaLabel="Gjennomsnittlig oppmøte per ukedag"
      />
    </figure>
  );
}

export interface AnalyticsChartsProps {
  analytics: OrganizationAnalytics;
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className={styles.charts}>
      <AttendanceChart analytics={analytics} />
      <FollowerChart analytics={analytics} />
      <WeekdayChart analytics={analytics} />
    </div>
  );
}
