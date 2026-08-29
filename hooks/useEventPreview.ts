import { useRef, useState } from "react";

import type { Event } from "../types/types";

export interface AnchorRect {
  left: number;
  top: number;
  bottom: number;
}

export interface EventPreview {
  event: Event;
  anchor: AnchorRect;
}

const CLOSE_GRACE_MS = 150;

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
    const { left, top, bottom } = anchor.getBoundingClientRect();
    setPreview({ event, anchor: { left, top, bottom } });
  };

  return {
    preview,
    showFor,
    cancelClose,
    scheduleClose,
  };
}
