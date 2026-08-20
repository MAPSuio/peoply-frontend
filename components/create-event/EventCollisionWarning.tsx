import useSWR from "swr";

import type { Event } from "../../types/types";
import { formatDateAndTime } from "../../utils/functions";
import WarningIcon from "../svgs/WarningIcon";
import styles from "../../styles/CreateEvent.module.scss";

/* Events without an end time are treated as lasting two hours - both the one
   being created and the ones checked against. */
const FALLBACK_DURATION_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const timeOfDay = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
});

const endOf = (start: Date, end: Date | null): Date =>
  end ?? new Date(start.getTime() + FALLBACK_DURATION_MS);

export interface EventCollisionWarningProps {
  dateStart: string;
  timeStart: string;
  dateEnd: string | null;
  timeEnd: string | null;
  hasDateEnd: boolean;
  timesAreValid: boolean;
}

/**
 * Warns when the chosen interval overlaps other published events, so the
 * organizer can dodge the collision before the event goes out. Fetches the
 * surrounding days once the chosen times are valid; silent otherwise.
 */
export default function EventCollisionWarning({
  dateStart,
  timeStart,
  dateEnd,
  timeEnd,
  hasDateEnd,
  timesAreValid,
}: EventCollisionWarningProps) {
  const ready = timesAreValid && Boolean(dateStart) && Boolean(timeStart);
  const chosenStart = ready
    ? new Date(formatDateAndTime(dateStart, timeStart))
    : null;
  const chosenEnd =
    chosenStart &&
    endOf(
      chosenStart,
      hasDateEnd && dateEnd && timeEnd
        ? new Date(formatDateAndTime(dateEnd, timeEnd))
        : null,
    );

  /* One day of margin on both sides catches events that cross midnight. The
     key only changes when the chosen dates change, not on every keystroke in
     the time fields. */
  const windowStart =
    chosenStart && new Date(chosenStart.getTime() - DAY_MS).toISOString();
  const windowEnd =
    chosenEnd && new Date(chosenEnd.getTime() + DAY_MS).toISOString();

  const { data: events } = useSWR<Event[]>(
    windowStart && windowEnd
      ? `/events?afterDate=${windowStart}&beforeDate=${windowEnd}&orderBy=startDate`
      : null,
  );

  if (!chosenStart || !chosenEnd || !events) {
    return null;
  }

  const collisions = events.filter((event) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = endOf(
      eventStart,
      event.endDate ? new Date(event.endDate) : null,
    );
    return eventStart < chosenEnd && chosenStart < eventEnd;
  });

  if (collisions.length === 0) {
    return null;
  }

  return (
    <div role="status" className={styles.collisionContainer}>
      <WarningIcon className={styles.collisionIcon} />
      <div>
        <p className={styles.collisionText}>Tidspunktet krasjer med:</p>
        <ul className={styles.collisionList}>
          {collisions.map((event) => {
            const eventStart = new Date(event.startDate);
            const eventEnd = endOf(
              eventStart,
              event.endDate ? new Date(event.endDate) : null,
            );
            return (
              <li key={event.id} className={styles.collisionText}>
                {event.title} · {timeOfDay.format(eventStart)}–
                {timeOfDay.format(eventEnd)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
