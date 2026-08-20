import useSWR from "swr";

import type { EventObjectProps } from "../../hooks/useCreateEventForm";
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

const spanOf = (event: Event): { start: Date; end: Date } => {
  const start = new Date(event.startDate);
  return {
    start,
    end: endOf(start, event.endDate ? new Date(event.endDate) : null),
  };
};

interface ChosenInterval {
  start: Date;
  end: Date;
}

function chosenInterval(
  eventObject: EventObjectProps,
  valid: boolean,
): ChosenInterval | null {
  const { eventDateStart, eventTimeStart } = eventObject;
  if (!valid || !eventDateStart || !eventTimeStart) {
    return null;
  }

  const start = new Date(formatDateAndTime(eventDateStart, eventTimeStart));
  const hasEnd =
    eventObject.eventHasDateEnd &&
    eventObject.eventDateEnd &&
    eventObject.eventTimeEnd;
  const end = endOf(
    start,
    hasEnd
      ? new Date(
          formatDateAndTime(
            eventObject.eventDateEnd as string,
            eventObject.eventTimeEnd as string,
          ),
        )
      : null,
  );

  return { start, end };
}

export interface EventCollisionWarningProps {
  eventObject: EventObjectProps;
  dateStartValid: boolean;
  timeStartValid: boolean;
  dateEndValid: boolean;
  timeEndValid: boolean;
}

/**
 * Warns when the chosen interval overlaps other published events, so the
 * organizer can dodge the collision before the event goes out. Purely
 * informational - it never blocks the wizard. Fetches the surrounding days
 * once the chosen times are valid; silent otherwise.
 */
export default function EventCollisionWarning({
  eventObject,
  dateStartValid,
  timeStartValid,
  dateEndValid,
  timeEndValid,
}: EventCollisionWarningProps) {
  const chosen = chosenInterval(
    eventObject,
    dateStartValid && timeStartValid && dateEndValid && timeEndValid,
  );

  /* One day of margin on both sides catches events that cross midnight. The
     key only changes when the chosen dates change, not on every keystroke in
     the time fields. */
  const { data: events } = useSWR<Event[]>(
    chosen
      ? `/events?afterDate=${new Date(chosen.start.getTime() - DAY_MS).toISOString()}&beforeDate=${new Date(chosen.end.getTime() + DAY_MS).toISOString()}&orderBy=startDate`
      : null,
  );

  if (!chosen || !events) {
    return null;
  }

  const collisions = events.filter((event) => {
    const span = spanOf(event);
    return span.start < chosen.end && chosen.start < span.end;
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
            const span = spanOf(event);
            return (
              <li key={event.id} className={styles.collisionText}>
                {event.title} · {timeOfDay.format(span.start)}–
                {timeOfDay.format(span.end)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
