import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventCalendar from "../components/EventCalendar";
import type { Event } from "../types/types";
import type { AvatarContent } from "../utils/avatar";
import {
  WINDOWS_IN_HORIZON,
  rollingCalendarRange,
} from "../utils/calendarEvents";

function renderCalendar(events: Event[]) {
  return render(
    <EventCalendar events={events} range={rollingCalendarRange(new Date())} />,
  );
}

const routerPush = vi.fn();

interface MockCalendarEvent {
  color: string;
  title: string;
  url: string;
  extendedProps: {
    arranger: string;
    arrangerAvatar: AvatarContent;
    paletteKey: string;
    startTime: string;
    sourceEvent: Event;
  };
}

type EventContentRenderer = (arg: {
  event: MockCalendarEvent;
  timeText: string;
  view: { type: string };
}) => ReactNode;

interface MockCalendarProps {
  dayCellClass: unknown;
  dayHeaderInnerClass: unknown;
  eventContent: EventContentRenderer;
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

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: the mock stands in for next/image
    <img alt={alt} src={src} />
  ),
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
      <div data-testid="calendar-instance">
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
      </div>
    );
  },
}));

const ORGANIZATION = {
  id: "org-1",
  urlId: "maps",
  name: "MAPS",
  image: "https://blob.test/maps.png",
  orgNr: "123456789",
};

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

function eventArrangedBy(organization: {
  id: string;
  name: string;
  image?: string;
  imagePrimaryColor?: string;
  imageAccentColor?: string;
}) {
  return {
    ...EVENT,
    eventArrangers: [
      {
        arrangerId: "arranger-1",
        arranger: { id: "arranger-1", isBusiness: true, organization },
      },
    ],
  } as unknown as Event;
}

function stubViewport({ isDesktop }: { isDesktop: boolean }) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: isDesktop,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe("EventCalendar", () => {
  beforeEach(() => {
    routerPush.mockReset();
    stubViewport({ isDesktop: true });
  });

  it("shows event information on hover and keeps it open while entering the preview", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderCalendar([EVENT]);
    const event = screen.getAllByRole("link", { name: "Kodekveld" })[0];

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
    renderCalendar([EVENT]);
    const event = screen.getAllByRole("link", { name: "Kodekveld" })[0];

    await user.tab();
    expect(screen.getByRole("tooltip")).toHaveTextContent("Kodekveld");

    await user.click(event);
    expect(routerPush).toHaveBeenCalledWith("/events/kodekveld");
  });

  it("reaches a year ahead once the reader asks to see more", async () => {
    renderCalendar([EVENT]);

    await userEvent.click(screen.getByRole("button", { name: "Se mer" }));

    expect(screen.getAllByTestId("calendar-instance")).toHaveLength(
      WINDOWS_IN_HORIZON,
    );
    expect(
      screen.queryByRole("button", { name: "Se mer" }),
    ).not.toBeInTheDocument();
  });

  it("uses the coordinated v7 configuration and event color fields", () => {
    renderCalendar([EVENT]);

    expect(calendarProps.plugins).toHaveLength(3);
    expect(calendarProps.tableHeaderSticky).toBe(false);
    expect(calendarProps.dayCellClass).toBeTypeOf("function");
    expect(calendarProps.dayHeaderInnerClass).toBeTypeOf("function");
    expect(calendarProps.eventContent).toBeTypeOf("function");
    expect(calendarProps.views).toHaveProperty("dayGrid.eventClass");
    expect(calendarProps.views).toHaveProperty(
      "agendaWindow.listItemEventClass",
    );
    expect(calendarProps.events[0]).toMatchObject({
      extendedProps: { paletteKey: expect.any(String) },
    });
    expect(calendarProps.events[0]).not.toHaveProperty("backgroundColor");
    expect(calendarProps.events[0]).not.toHaveProperty("borderColor");
  });

  it("shows the arranger's picture in the agenda instead of a colored dot", () => {
    renderCalendar([eventArrangedBy(ORGANIZATION)]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "18:00",
        view: { type: "agendaWindow" },
      }),
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      ORGANIZATION.image,
    );
  });

  it("falls back to the arranger's initial when there is no picture", () => {
    renderCalendar([eventArrangedBy({ ...ORGANIZATION, image: undefined })]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "18:00",
        view: { type: "agendaWindow" },
      }),
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("M");
  });

  it("shows the arranger's logo in the month grid too", () => {
    renderCalendar([eventArrangedBy(ORGANIZATION)]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "18:00",
        view: { type: "dayGridRolling" },
      }),
    );

    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      ORGANIZATION.image,
    );
  });

  it("keeps the start time in the month grid when the cell is too narrow for FullCalendar to render one", () => {
    renderCalendar([eventArrangedBy(ORGANIZATION)]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "",
        view: { type: "dayGridRolling" },
      }),
    );

    expect(container).toHaveTextContent(
      calendarProps.events[0].extendedProps.startTime,
    );
  });

  it("falls back to the initial in the month grid when there is no logo", () => {
    renderCalendar([eventArrangedBy({ ...ORGANIZATION, image: undefined })]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "18:00",
        view: { type: "dayGridRolling" },
      }),
    );

    expect(container.querySelector("img")).toBeNull();
    expect(within(container).getByText("M")).toBeInTheDocument();
  });

  it("keeps the arranger icon out of what a screen reader reads on the event", () => {
    renderCalendar([eventArrangedBy({ ...ORGANIZATION, image: undefined })]);

    const { container } = render(
      calendarProps.eventContent({
        event: calendarProps.events[0],
        timeText: "18:00",
        view: { type: "agendaWindow" },
      }),
    );

    const initial = within(container).getByText("M");

    expect(initial.closest("[aria-hidden='true']")).not.toBeNull();
  });

  const colorsPaintedOn = (
    calendar: HTMLElement,
    event: HTMLElement,
    property: string,
  ) =>
    calendar.style.getPropertyValue(
      event.style.getPropertyValue(property).replace(/^var\(|\)$/g, ""),
    );

  it("paints an event in the colors stored with its arranger's logo", () => {
    const { container } = renderCalendar([
      eventArrangedBy({
        ...ORGANIZATION,
        imagePrimaryColor: "#fd7b03",
        imageAccentColor: "#0051f1",
      }),
    ]);
    const calendar = container.firstElementChild as HTMLElement;
    const event = screen.getAllByRole("link", { name: "Kodekveld" })[0];

    expect(colorsPaintedOn(calendar, event, "--calendar-event-accent")).toBe(
      "#0051f1",
    );
    expect(
      colorsPaintedOn(calendar, event, "--calendar-event-background"),
    ).toBe("#fd7b0329");
  });

  it("falls back to a color of its own when the logo yielded none", () => {
    const { container } = renderCalendar([eventArrangedBy(ORGANIZATION)]);
    const calendar = container.firstElementChild as HTMLElement;
    const event = screen.getAllByRole("link", { name: "Kodekveld" })[0];

    expect(colorsPaintedOn(calendar, event, "--calendar-event-accent")).toMatch(
      /^hsl\(/,
    );
  });
});
