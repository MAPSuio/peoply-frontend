import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AnalyticsCharts from "../components/organization/charts/AnalyticsCharts";
import type { OrganizationAnalytics } from "../types/types";

const ATTENDANCE_LABEL =
  "Påmeldte og venteliste per arrangement i valgt periode";
const FOLLOWER_LABEL = "Netto følgerutvikling i valgt periode";
const WEEKDAY_LABEL = "Gjennomsnittlig oppmøte per ukedag";

const analytics = {
  events: {
    items: [
      {
        startDate: "2026-08-01T17:00:00.000Z",
        goingCount: 12,
        waitlistedCount: 3,
      },
      {
        startDate: "2026-08-08T17:00:00.000Z",
        goingCount: 20,
        waitlistedCount: 0,
      },
    ],
    byWeekday: [
      { weekday: 1, averageGoing: 8 },
      { weekday: 5, averageGoing: 16 },
    ],
  },
  followers: {
    dailyNet: [
      { date: "2026-08-01", net: 2 },
      { date: "2026-08-02", net: -1 },
    ],
  },
} as unknown as OrganizationAnalytics;

function chartLabelled(label: string) {
  return screen.getByLabelText(label);
}

describe("AnalyticsCharts", () => {
  it("draws one bar per series for every event", () => {
    render(<AnalyticsCharts analytics={analytics} />);

    expect(
      chartLabelled(ATTENDANCE_LABEL).querySelectorAll("rect"),
    ).toHaveLength(4);
  });

  it("draws the follower total as a single line", () => {
    render(<AnalyticsCharts analytics={analytics} />);

    expect(chartLabelled(FOLLOWER_LABEL).querySelectorAll("path")).toHaveLength(
      1,
    );
  });

  it("draws one bar per weekday bucket", () => {
    render(<AnalyticsCharts analytics={analytics} />);

    expect(chartLabelled(WEEKDAY_LABEL).querySelectorAll("rect")).toHaveLength(
      2,
    );
  });
});
