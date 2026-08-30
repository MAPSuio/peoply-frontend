import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EventCalendar from "../components/EventCalendar";
import type { Event } from "../types/types";
import {
  WINDOWS_SHOWN_AT_FIRST,
  calendarWindows,
  rollingCalendarRange,
  windowRangeLabel,
} from "../utils/calendarEvents";

vi.mock("next/router", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // biome-ignore lint/performance/noImgElement: the mock stands in for next/image
    <img alt={alt} src={src} />
  ),
}));

const A_SUNDAY = new Date(2026, 7, 30, 13, 45);

const DAYS_PER_WINDOW = 35;

const dayCellFormatter = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function stubDesktopViewport() {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: true,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function renderCalendar(events: Event[] = []) {
  return render(
    <EventCalendar events={events} range={rollingCalendarRange(A_SUNDAY)} />,
  );
}

function windowSections() {
  return screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.closest("section") as HTMLElement);
}

function dayCellsOf(section: HTMLElement) {
  return [...section.querySelectorAll("[role='gridcell']")];
}

function lastDayOf({ end }: { end: Date }) {
  const lastDay = new Date(end);
  lastDay.setDate(lastDay.getDate() - 1);

  return lastDay;
}

describe("EventCalendar windows in a real FullCalendar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(A_SUNDAY);
    stubDesktopViewport();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("draws exactly the days each window heading promises", () => {
    renderCalendar();

    const expectedWindows = calendarWindows(A_SUNDAY, WINDOWS_SHOWN_AT_FIRST);
    const sections = windowSections();

    expect(sections).toHaveLength(WINDOWS_SHOWN_AT_FIRST);

    for (const [index, section] of sections.entries()) {
      const expectedWindow = expectedWindows[index];
      const dayCells = dayCellsOf(section);

      expect(
        within(section).getByRole("heading", { level: 2 }),
      ).toHaveTextContent(windowRangeLabel(expectedWindow));
      expect(dayCells).toHaveLength(DAYS_PER_WINDOW);
      expect(dayCells.at(-1)).toHaveAttribute(
        "aria-label",
        dayCellFormatter.format(lastDayOf(expectedWindow)),
      );
    }
  });

  it("hands the next window the day after the last one ends", () => {
    renderCalendar();

    const expectedWindows = calendarWindows(A_SUNDAY, WINDOWS_SHOWN_AT_FIRST);

    for (const [index, section] of windowSections().slice(1).entries()) {
      expect(dayCellsOf(section)[0]).toHaveAttribute(
        "aria-label",
        dayCellFormatter.format(expectedWindows[index + 1].start),
      );
    }
  });

  it("greys out the days of this week that have already been", () => {
    renderCalendar();

    const [firstWindow] = windowSections();
    const dayCells = dayCellsOf(firstWindow);
    const daysBeforeToday = dayCells.filter(
      (cell) => cell.getAttribute("aria-disabled") === "true",
    );

    expect(daysBeforeToday).toHaveLength(6);
    expect(dayCells[daysBeforeToday.length]).toHaveAttribute(
      "aria-label",
      dayCellFormatter.format(A_SUNDAY),
    );
  });

  it("still shows an event that started earlier today", () => {
    const eventEarlierToday = {
      id: "event-1",
      urlId: "frokost",
      title: "Frokostmøte",
      startDate: new Date(2026, 7, 30, 8, 0).toISOString(),
      endDate: new Date(2026, 7, 30, 9, 0).toISOString(),
      description: "",
      locationName: "Ole-Johan Dahls hus",
      visibility: "PUBLIC",
      eventArrangers: [],
    } as unknown as Event;

    renderCalendar([eventEarlierToday]);

    expect(screen.getAllByText("Frokostmøte").length).toBeGreaterThan(0);
  });
});
