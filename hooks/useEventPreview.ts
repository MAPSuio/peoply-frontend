import { useRef, useState } from "react";

import type { Event } from "../types/types";

export interface EventPreview {
  event: Event;
  position: { left: number; top: number };
}

const CLOSE_GRACE_MS = 150;
const ANCHOR_GAP_PX = 8;

export default function useEventPreview() {
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [preview, setPreview] = useState<EventPreview>();

  const cancelClose = () => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = undefined;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimeout.current = setTimeout(() => {
      setPreview(undefined);
    }, CLOSE_GRACE_MS);
  };

  const showFor = (anchor: HTMLElement, event: Event) => {
    cancelClose();
    const rect = anchor.getBoundingClientRect();
    setPreview({
      event,
      position: { left: rect.left, top: rect.bottom + ANCHOR_GAP_PX },
    });
  };

  return {
    preview,
    showFor,
    cancelClose,
    scheduleClose,
  };
}
