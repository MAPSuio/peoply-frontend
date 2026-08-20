import { describe, expect, it } from "vitest";

import {
  bestTimeLabel,
  formatCount,
  formatDays,
  formatDelta,
  formatPercent,
} from "../utils/analyticsFormat";

describe("analyticsFormat", () => {
  it("formats deltas with an explicit sign", () => {
    expect(formatDelta(12)).toBe("+12");
    expect(formatDelta(-3)).toBe("-3");
    expect(formatDelta(0)).toBe("0");
  });

  it("formats rates as rounded percentages", () => {
    expect(formatPercent(0.42)).toBe("42 %");
    expect(formatPercent(2 / 3)).toBe("67 %");
    expect(formatPercent(0)).toBe("0 %");
  });

  it("renders missing metrics as an em dash", () => {
    expect(formatPercent(null)).toBe("—");
    expect(formatDays(null)).toBe("—");
    expect(formatCount(null)).toBe("—");
  });

  it("formats day counts and plain counts", () => {
    expect(formatDays(7)).toBe("7 d");
    expect(formatDays(0.5)).toBe("0,5 d");
    expect(formatCount(42)).toBe("42");
    expect(formatCount(1.6667)).toBe("1,7");
  });

  it("labels the best weekday and time of day in Norwegian", () => {
    const byWeekday = [
      { weekday: 0, averageGoing: 0, eventCount: 0 },
      { weekday: 1, averageGoing: 1.5, eventCount: 2 },
      { weekday: 2, averageGoing: 0, eventCount: 0 },
      { weekday: 3, averageGoing: 2, eventCount: 1 },
      { weekday: 4, averageGoing: 0, eventCount: 0 },
      { weekday: 5, averageGoing: 0, eventCount: 0 },
      { weekday: 6, averageGoing: 0, eventCount: 0 },
    ];
    const byTimeOfDay = [
      { bucket: "MORNING" as const, averageGoing: 2, eventCount: 1 },
      { bucket: "AFTERNOON" as const, averageGoing: 1, eventCount: 1 },
      { bucket: "EVENING" as const, averageGoing: 2.5, eventCount: 2 },
    ];

    expect(bestTimeLabel(byWeekday, byTimeOfDay)).toBe("Tor kveld");
  });

  it("labels the best time as an em dash without events", () => {
    const empty = Array.from({ length: 7 }, (_, weekday) => ({
      weekday,
      averageGoing: 0,
      eventCount: 0,
    }));

    expect(bestTimeLabel(empty, [])).toBe("—");
  });
});
