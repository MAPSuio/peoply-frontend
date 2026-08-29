import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventPreviewCard from "../components/EventPreviewCard";
import type { EventPreview } from "../hooks/useEventPreview";
import type { Event } from "../types/types";

const CARD_WIDTH_PX = 320;

const EVENT = {
  id: "event-1",
  urlId: "kodekveld",
  title: "Kodekveld",
  startDate: "2026-09-03T16:00:00.000Z",
  endDate: "2026-09-03T18:00:00.000Z",
  locationName: "Ole-Johan Dahls hus",
  eventArrangers: [],
} as unknown as Event;

function renderAt(left: number, viewportWidth: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: CARD_WIDTH_PX,
  });
  window.innerWidth = viewportWidth;

  const preview: EventPreview = { event: EVENT, position: { left, top: 120 } };
  render(<EventPreviewCard onMount={vi.fn()} preview={preview} />);

  return screen.getByRole("tooltip");
}

afterEach(() => {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: 0,
  });
});

describe("EventPreviewCard", () => {
  it("stays inside a 390px screen when the event it belongs to sits far right", () => {
    const card = renderAt(300, 390);

    expect(card.style.left).toBe("62px");
  });

  it("stays inside the left edge when the event sits at the very start of the row", () => {
    const card = renderAt(-40, 390);

    expect(card.style.left).toBe("8px");
  });

  it("leaves the position alone when the card already fits", () => {
    const card = renderAt(400, 1440);

    expect(card.style.left).toBe("400px");
  });
});
