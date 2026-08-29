import { useLayoutEffect, useRef, useState } from "react";

import type { AnchorRect, EventPreview } from "../hooks/useEventPreview";
import styles from "../styles/CalendarPage.module.scss";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";
import { formatDateRange, formatTimeRange } from "../utils/functions";

export const EVENT_PREVIEW_ID = "calendar-event-preview";

const MAX_VISIBLE_ARRANGERS = 2;
const VIEWPORT_MARGIN_PX = 8;
const ANCHOR_GAP_PX = 8;

interface CardSize {
  width: number;
  height: number;
}

function placeHorizontally(anchor: AnchorRect, card: CardSize) {
  const rightmost = window.innerWidth - card.width - VIEWPORT_MARGIN_PX;
  return Math.max(VIEWPORT_MARGIN_PX, Math.min(anchor.left, rightmost));
}

function placeVertically(anchor: AnchorRect, card: CardSize) {
  const under = anchor.bottom + ANCHOR_GAP_PX;
  if (under + card.height + VIEWPORT_MARGIN_PX <= window.innerHeight) {
    return under;
  }

  const above = anchor.top - ANCHOR_GAP_PX - card.height;
  if (above >= VIEWPORT_MARGIN_PX) return above;

  const lowest = window.innerHeight - card.height - VIEWPORT_MARGIN_PX;
  return Math.max(VIEWPORT_MARGIN_PX, lowest);
}

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
  const { event, anchor } = preview;
  const card = useRef<HTMLElement | null>(null);
  const [placement, setPlacement] = useState({
    left: anchor.left,
    top: anchor.bottom + ANCHOR_GAP_PX,
  });

  useLayoutEffect(() => {
    const size = {
      width: card.current?.offsetWidth ?? 0,
      height: card.current?.offsetHeight ?? 0,
    };
    setPlacement({
      left: placeHorizontally(anchor, size),
      top: placeVertically(anchor, size),
    });
  }, [anchor]);

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
      style={placement}
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
