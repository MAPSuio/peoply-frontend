import { useLayoutEffect, useRef, useState } from "react";

import type { EventPreview } from "../hooks/useEventPreview";
import styles from "../styles/CalendarPage.module.scss";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";
import { formatDateRange, formatTimeRange } from "../utils/functions";

export const EVENT_PREVIEW_ID = "calendar-event-preview";

const MAX_VISIBLE_ARRANGERS = 2;
const VIEWPORT_MARGIN_PX = 8;

export interface EventPreviewCardProps {
  preview: EventPreview;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}

export default function EventPreviewCard({
  preview,
  onPointerEnter,
  onPointerLeave,
}: EventPreviewCardProps) {
  const { event, position } = preview;
  const card = useRef<HTMLElement | null>(null);
  const [left, setLeft] = useState(position.left);

  useLayoutEffect(() => {
    const rightmost =
      window.innerWidth - (card.current?.offsetWidth ?? 0) - VIEWPORT_MARGIN_PX;
    setLeft(Math.max(VIEWPORT_MARGIN_PX, Math.min(position.left, rightmost)));
  }, [position.left]);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const arranger = getCompactEventArrangerLabel(event, MAX_VISIBLE_ARRANGERS);

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: the handlers only keep an already-visible tooltip open while the pointer rests on it; the keyboard path runs through focus on the event link.
    <aside
      aria-live="polite"
      className={styles.eventPreview}
      id={EVENT_PREVIEW_ID}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      ref={card}
      role="tooltip"
      style={{ left, top: position.top }}
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
