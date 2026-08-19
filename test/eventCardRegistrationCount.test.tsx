import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventCard from "../components/EventCard";
import LargeEventCard from "../components/LargeEventCard";
import { type Event, EventRegistrationMode } from "../types/types";

/* The cards' children pull in images, auth context and their own data hooks,
   none of which decide whether an attendee count is rendered. */
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("next/legacy/image", () => ({ default: () => null }));
vi.mock("../components/EventActions", () => ({ default: () => null }));
vi.mock("../components/ArrangerAvatar", () => ({ default: () => null }));
vi.mock("../components/HeartIconGlass", () => ({ default: () => null }));
vi.mock("../components/Link", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock("../hooks/useEventFavorite", () => ({
  default: () => ({
    favorited: false,
    loading: false,
    toggleFavorite: vi.fn(),
  }),
}));

const fetcher = vi.fn();

const makeEvent = (registrationMode: EventRegistrationMode): Event =>
  ({
    id: "event-1",
    urlId: "event-1",
    title: "Kodekveld",
    startDate: new Date(2026, 6, 28, 18, 0, 0).toISOString(),
    endDate: null,
    locationName: "Ole-Johan Dahls hus",
    capacity: 60,
    goingCount: 42,
    registrationMode,
  }) as Event;

function renderCard(card: ReactNode) {
  return render(
    <SWRConfig value={{ fetcher, provider: () => new Map() }}>
      {card}
    </SWRConfig>,
  );
}

/* 42 going out of 60 seats: both numbers, and the "42/60" the cards compose
   out of them, have to be absent for an event registered for elsewhere. */
const countTexts = [/42/, /60/];

describe("attendee counts on event cards", () => {
  beforeEach(() => {
    fetcher.mockReset();
    fetcher.mockResolvedValue(42);
  });

  describe("EventCard", () => {
    it("shows the count for registration in Peoply", () => {
      renderCard(<EventCard event={makeEvent(EventRegistrationMode.PEOPLY)} />);

      expect(screen.getByText(/42/)).toBeInTheDocument();
    });

    it("shows no count for external registration", async () => {
      renderCard(
        <EventCard event={makeEvent(EventRegistrationMode.EXTERNAL)} />,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      for (const text of countTexts) {
        expect(screen.queryByText(text)).not.toBeInTheDocument();
      }
      expect(fetcher).not.toHaveBeenCalled();
    });
  });

  describe("LargeEventCard", () => {
    it("shows the count for registration in Peoply", () => {
      renderCard(
        <LargeEventCard event={makeEvent(EventRegistrationMode.PEOPLY)} />,
      );

      expect(screen.getByText(/42/)).toBeInTheDocument();
    });

    it("shows no count for external registration", async () => {
      renderCard(
        <LargeEventCard event={makeEvent(EventRegistrationMode.EXTERNAL)} />,
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      for (const text of countTexts) {
        expect(screen.queryByText(text)).not.toBeInTheDocument();
      }
      expect(fetcher).not.toHaveBeenCalled();
    });
  });
});
