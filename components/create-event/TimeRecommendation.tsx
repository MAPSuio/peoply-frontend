import useSWR from "swr";

import useUser from "../../hooks/useUser";
import type {
  OrganizationAnalytics,
  OrganizationAnalyticsTimeOfDay,
} from "../../types/types";
import { weekdayLabelLong } from "../../utils/analyticsFormat";
import InfoIconSummary from "../svgs/InfoIconSummary";
import styles from "../../styles/CreateEvent.module.scss";

const MAX_SUGGESTIONS = 2;

/* Representative start time per slot; the organizer adjusts afterwards. */
const TIME_OF_DAY_STARTS = {
  MORNING: "10:00",
  AFTERNOON: "14:00",
  EVENING: "18:00",
} as const;

const toDateInputValue = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;

/** The next date falling on `weekday` (0 = Monday), today included when the
 *  slot's start time is still ahead of us. */
function nextDateFor(weekday: number, time: string): string {
  const now = new Date();
  const jsTarget = (weekday + 1) % 7;
  let daysAhead = (jsTarget - now.getDay() + 7) % 7;
  if (daysAhead === 0) {
    const [hours, minutes] = time.split(":").map(Number);
    const slotStart = new Date(now);
    slotStart.setHours(hours, minutes, 0, 0);
    if (slotStart <= now) {
      daysAhead = 7;
    }
  }
  const candidate = new Date(now);
  candidate.setDate(candidate.getDate() + daysAhead);
  return toDateInputValue(candidate);
}

function bestTimeOfDay(
  byTimeOfDay: OrganizationAnalyticsTimeOfDay[],
): keyof typeof TIME_OF_DAY_STARTS {
  const best = byTimeOfDay
    .filter((bucket) => bucket.eventCount > 0)
    .sort((a, b) => b.averageGoing - a.averageGoing)[0];
  return best?.bucket ?? "EVENING";
}

export interface TimeRecommendationProps {
  arrangerId: string;
  /** Applies a suggestion: date is yyyy-mm-dd, time is HH:mm. */
  onSelect: (date: string, time: string) => void;
}

/**
 * Suggests the selected org's historically best time slots, from the same
 * analytics payload as the Statistikk tab; a click fills the start fields.
 * Personal arrangers have no org (and no analytics access), and an org
 * without event history has nothing to recommend - both render nothing, so
 * the step looks exactly as before.
 */
export default function TimeRecommendation({
  arrangerId,
  onSelect,
}: TimeRecommendationProps) {
  const { orgs } = useUser();
  const organization = orgs?.find((org) => org.arrangerId === arrangerId);

  const { data } = useSWR<OrganizationAnalytics>(
    organization
      ? `/organizations/${organization.id}/analytics?period=1y`
      : null,
  );

  const bestWeekdays =
    data?.events.byWeekday
      .filter((bucket) => bucket.eventCount > 0)
      .sort((a, b) => b.averageGoing - a.averageGoing)
      .slice(0, MAX_SUGGESTIONS) ?? [];
  if (!data || bestWeekdays.length === 0) {
    return null;
  }

  const slot = bestTimeOfDay(data.events.byTimeOfDay);
  const time = TIME_OF_DAY_STARTS[slot];

  return (
    <div className={styles.recommendationContainer}>
      <div className={styles.recommendationHeading}>
        <InfoIconSummary className={styles.recommendationIcon} />
        <p className={styles.recommendationText}>Beste tidspunkt for dere:</p>
      </div>
      <ul className={styles.recommendationList}>
        {bestWeekdays.map((bucket) => (
          <li key={bucket.weekday}>
            <button
              type="button"
              className={styles.recommendationChip}
              onClick={() => onSelect(nextDateFor(bucket.weekday, time), time)}
            >
              {weekdayLabelLong(bucket.weekday)} {time}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
