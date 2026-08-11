import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventCalendar from "../components/EventCalendar";
import type { Event } from "../types/types";

const routerPush = vi.fn();

interface MockCalendarEvent {
  color: string;
  title: string;
  url: string;
  extendedProps: { backgroundColor: string; sourceEvent: Event };
}

interface MockCalendarProps {
  buttons: { listUpcoming: { text: string } };
  dayCellClass: unknown;
  dayHeaderInnerClass: unknown;
  eventContent: unknown;
  eventClick: (info: {
    event: MockCalendarEvent;
    jsEvent: { preventDefault: () => void };
  }) => void;
  eventDidMount: (info: {
    el: HTMLAnchorElement;
    event: MockCalendarEvent;
  }) => void;
  eventMouseEnter: (info: {
    el: HTMLAnchorElement;
    event: MockCalendarEvent;
  }) => void;
  eventMouseLeave: () => void;
  events: MockCalendarEvent[];
  plugins: unknown[];
  tableHeaderSticky: boolean;
  views: Record<string, unknown>;
}

let calendarProps: MockCalendarProps;

vi.mock("next/router", () => ({
  useRouter: () => ({ push: routerPush }),
}));

vi.mock("@fullcalendar/react", () => ({
  default: (props: MockCalendarProps) => {
    calendarProps = props;
    const {
      eventClick,
      eventDidMount,
      eventMouseEnter,
      eventMouseLeave,
      events,
    } = props;
    const event = {
      ...events[0],
      extendedProps: events[0].extendedProps,
    };
    return (
      <a
        href={event.url}
        onBlur={() => eventMouseLeave()}
        onClick={(jsEvent) => eventClick({ event, jsEvent })}
        onMouseEnter={(mouseEvent) =>
          eventMouseEnter({ el: mouseEvent.currentTarget, event })
        }
        onMouseLeave={() => eventMouseLeave()}
        ref={(element) => {
          if (element) eventDidMount({ el: element, event });
        }}
      >
        {event.title}
      </a>
    );
  },
}));

const EVENT = {
  id: "event-1",
  urlId: "kodekveld",
  title: "Kodekveld",
  startDate: "2026-08-03T16:00:00.000Z",
  endDate: "2026-08-03T18:00:00.000Z",
  regStart: null,
  regEnd: null,
  description: "En kveld med kode og pizza.",
  hasFood: false,
  locationName: "Ole-Johan Dahls hus",
  visibility: "PUBLIC",
  eventArrangers: [],
} as Event;

describe("EventCalendar", () => {
  beforeEach(() => {
    routerPush.mockReset();
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
  });

  it("shows event information on hover and keeps it open while entering the preview", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<EventCalendar events={[EVENT]} />);
    const event = screen.getByRole("link", { name: "Kodekveld" });

    await userEvent.hover(event);
    const preview = screen.getByRole("tooltip");
    expect(preview).toHaveTextContent("En kveld med kode og pizza.");
    expect(preview).toHaveTextContent("Ole-Johan Dahls hus");

    fireEvent.mouseLeave(event);
    fireEvent.mouseEnter(preview);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    fireEvent.mouseLeave(preview);
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows the preview on keyboard focus without changing event navigation", async () => {
    const user = userEvent.setup();
    render(<EventCalendar events={[EVENT]} />);
    const event = screen.getByRole("link", { name: "Kodekveld" });

    await user.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Kodekveld");

    await user.click(event);
    expect(routerPush).toHaveBeenCalledWith("/events/kodekveld");
  });

  it("uses the coordinated v7 configuration and event color fields", () => {
    render(<EventCalendar events={[EVENT]} />);

    expect(calendarProps.plugins).toHaveLength(3);
    expect(calendarProps.buttons.listUpcoming.text).toBe("Agenda");
    expect(calendarProps.tableHeaderSticky).toBe(false);
    expect(calendarProps.dayCellClass).toBeTypeOf("function");
    expect(calendarProps.dayHeaderInnerClass).toBeTypeOf("function");
    expect(calendarProps.eventContent).toBeTypeOf("function");
    expect(calendarProps.views).toHaveProperty("dayGrid.eventClass");
    expect(calendarProps.views).toHaveProperty(
      "listUpcoming.listItemEventClass",
    );
    expect(calendarProps.events[0]).toMatchObject({
      color: expect.any(String),
      extendedProps: { backgroundColor: expect.any(String) },
    });
    expect(calendarProps.events[0]).not.toHaveProperty("backgroundColor");
    expect(calendarProps.events[0]).not.toHaveProperty("borderColor");
  });
});
