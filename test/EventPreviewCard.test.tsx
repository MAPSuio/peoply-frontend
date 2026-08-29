import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventPreviewCard from "../components/EventPreviewCard";
import type { EventPreview } from "../hooks/useEventPreview";
import type { Event } from "../types/types";

const CARD_WIDTH_PX = 320;
const CARD_HEIGHT_PX = 200;

const EVENT = {
  id: "event-1",
  urlId: "kodekveld",
  title: "Kodekveld",
  startDate: "2026-09-03T16:00:00.000Z",
  endDate: "2026-09-03T18:00:00.000Z",
  locationName: "Ole-Johan Dahls hus",
  eventArrangers: [],
} as unknown as Event;

function measureCardAs(width: number, height: number) {
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: height,
  });
}

function renderAnchoredAt(
  anchor: EventPreview["anchor"],
  viewport: { width: number; height: number },
) {
  window.innerWidth = viewport.width;
  window.innerHeight = viewport.height;

  render(
    <EventPreviewCard
      onPointerEnter={vi.fn()}
      onPointerLeave={vi.fn()}
      preview={{ event: EVENT, anchor }}
    />,
  );

  return screen.getByRole("tooltip");
}

function renderAt(left: number, viewportWidth: number) {
  measureCardAs(CARD_WIDTH_PX, CARD_HEIGHT_PX);

  return renderAnchoredAt(
    { left, top: 100, bottom: 120 },
    { width: viewportWidth, height: 900 },
  );
}

afterEach(() => {
  measureCardAs(0, 0);
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

  it("hangs under the event when there is room below it", () => {
    measureCardAs(CARD_WIDTH_PX, CARD_HEIGHT_PX);

    const card = renderAnchoredAt(
      { left: 400, top: 100, bottom: 130 },
      { width: 1440, height: 900 },
    );

    expect(card.style.top).toBe("138px");
  });

  it("flips above the event when the bottom of the screen is too close", () => {
    measureCardAs(CARD_WIDTH_PX, CARD_HEIGHT_PX);

    const card = renderAnchoredAt(
      { left: 40, top: 700, bottom: 730 },
      { width: 390, height: 844 },
    );

    expect(card.style.top).toBe("492px");
  });

  it("sits as far down as it fits when the card is too tall for either side", () => {
    measureCardAs(CARD_WIDTH_PX, 800);

    const card = renderAnchoredAt(
      { left: 40, top: 400, bottom: 430 },
      { width: 390, height: 844 },
    );

    expect(card.style.top).toBe("36px");
  });
});
