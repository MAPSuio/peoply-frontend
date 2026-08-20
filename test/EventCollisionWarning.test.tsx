import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EventCollisionWarning from "../components/create-event/EventCollisionWarning";
import type { EventObjectProps } from "../hooks/useCreateEventForm";
import type { Event } from "../types/types";

const eventObjectWith = (fields: Partial<EventObjectProps>): EventObjectProps =>
  ({
    eventDateStart: "",
    eventTimeStart: "",
    eventDateEnd: null,
    eventTimeEnd: null,
    eventHasDateEnd: false,
    ...fields,
  }) as EventObjectProps;

const fetcher = vi.fn();

function renderWithSwr(ui: ReactElement) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), dedupingInterval: 0, fetcher }}
    >
      {ui}
    </SWRConfig>,
  );
}

/* Local noon so date-string -> Date conversions stay on 2026-09-10
   regardless of the machine's timezone. */
const otherEvent = (startHour: number, endHour: number | null): Event =>
  ({
    id: `event-${startHour}`,
    urlId: `event-${startHour}`,
    title: "Navet-kveld",
    startDate: new Date(2026, 8, 10, startHour, 0, 0).toISOString(),
    endDate:
      endHour === null
        ? null
        : new Date(2026, 8, 10, endHour, 0, 0).toISOString(),
  }) as Event;

describe("EventCollisionWarning", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ now: new Date(2026, 8, 1, 12, 0, 0), toFake: ["Date"] });
    fetcher.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("warns when the chosen interval overlaps another event", async () => {
    fetcher.mockResolvedValue([otherEvent(18, 22)]);

    renderWithSwr(
      <EventCollisionWarning
        eventObject={eventObjectWith({
          eventDateStart: "2026-09-10",
          eventTimeStart: "19:00",
          eventDateEnd: "2026-09-10",
          eventTimeEnd: "21:00",
          eventHasDateEnd: true,
        })}
        dateStartValid
        timeStartValid
        dateEndValid
        timeEndValid
      />,
    );

    expect(await screen.findByText(/Navet-kveld/)).toBeDefined();
    expect(screen.getByText(/18:00/)).toBeDefined();
  });

  it("stays silent when nothing overlaps", async () => {
    fetcher.mockResolvedValue([otherEvent(8, 10)]);

    const { container } = renderWithSwr(
      <EventCollisionWarning
        eventObject={eventObjectWith({
          eventDateStart: "2026-09-10",
          eventTimeStart: "19:00",
          eventDateEnd: "2026-09-10",
          eventTimeEnd: "21:00",
          eventHasDateEnd: true,
        })}
        dateStartValid
        timeStartValid
        dateEndValid
        timeEndValid
      />,
    );

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("assumes two hours when no end time is set", async () => {
    // Chosen 19:00 (+2h -> 21:00): an event starting 20:30 collides.
    fetcher.mockResolvedValue([otherEvent(20, null)]);

    renderWithSwr(
      <EventCollisionWarning
        eventObject={eventObjectWith({
          eventDateStart: "2026-09-10",
          eventTimeStart: "19:00",
        })}
        dateStartValid
        timeStartValid
        dateEndValid
        timeEndValid
      />,
    );

    expect(await screen.findByText(/Navet-kveld/)).toBeDefined();
  });

  it("does not fetch until the chosen times are valid", () => {
    renderWithSwr(
      <EventCollisionWarning
        eventObject={eventObjectWith({})}
        dateStartValid={false}
        timeStartValid={false}
        dateEndValid
        timeEndValid
      />,
    );

    expect(fetcher).not.toHaveBeenCalled();
  });
});
