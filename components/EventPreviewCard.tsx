import type { EventPreview } from "../hooks/useEventPreview";
import styles from "../styles/CalendarPage.module.scss";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";
import { formatDateRange, formatTimeRange } from "../utils/functions";

export const EVENT_PREVIEW_ID = "calendar-event-preview";

const MAX_VISIBLE_ARRANGERS = 2;

export interface EventPreviewCardProps {
  preview: EventPreview;
  onMount: (element: HTMLElement | null) => void;
}

export default function EventPreviewCard({
  preview,
  onMount,
}: EventPreviewCardProps) {
  const { event, position } = preview;
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const arranger = getCompactEventArrangerLabel(event, MAX_VISIBLE_ARRANGERS);

  return (
    <aside
      aria-live="polite"
      className={styles.eventPreview}
      id={EVENT_PREVIEW_ID}
      ref={onMount}
      role="tooltip"
      style={position}
    >
      <p className={styles.eventPreviewDate}>
        {formatDateRange(startDate, endDate)} ·{" "}
        {formatTimeRange(startDate, endDate)}
      </p>
      <h2 className={styles.eventPreviewTitle}>{event.title}</h2>
      {arranger ? <p className={styles.eventPreviewMeta}>{arranger}</p> : null}
      {event.locationName ? (
        <p className={styles.eventPreviewMeta}>{event.locationName}</p>
      ) : null}
      {event.description ? (
        <p className={styles.eventPreviewDescription}>{event.description}</p>
      ) : null}
    </aside>
  );
}
