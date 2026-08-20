import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { SWRConfig } from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import TimeRecommendation from "../components/create-event/TimeRecommendation";
import type { Organization, OrganizationAnalytics } from "../types/types";

let orgs: Organization[] | undefined;

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: { id: "user-1" }, orgs }),
}));

const organization = {
  id: "org-1",
  arrangerId: "arranger-1",
  name: "MAPS",
} as Organization;

/* Thursday (3) is clearly best, Monday (0) second; evenings win. */
const analytics = {
  events: {
    byWeekday: [
      { weekday: 0, averageGoing: 4, eventCount: 1 },
      { weekday: 1, averageGoing: 1, eventCount: 1 },
      { weekday: 2, averageGoing: 0, eventCount: 0 },
      { weekday: 3, averageGoing: 8, eventCount: 2 },
      { weekday: 4, averageGoing: 0, eventCount: 0 },
      { weekday: 5, averageGoing: 0, eventCount: 0 },
      { weekday: 6, averageGoing: 0, eventCount: 0 },
    ],
    byTimeOfDay: [
      { bucket: "MORNING", averageGoing: 1, eventCount: 1 },
      { bucket: "AFTERNOON", averageGoing: 0, eventCount: 0 },
      { bucket: "EVENING", averageGoing: 8, eventCount: 2 },
    ],
  },
} as OrganizationAnalytics;

const fetcher = vi.fn();
const onSelect = vi.fn();

function renderWithSwr(ui: ReactElement) {
  return render(
    <SWRConfig
      value={{ provider: () => new Map(), dedupingInterval: 0, fetcher }}
    >
      {ui}
    </SWRConfig>,
  );
}

describe("TimeRecommendation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    orgs = [organization];
    fetcher.mockResolvedValue(analytics);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("offers the org's best time slots as clickable suggestions", async () => {
    renderWithSwr(
      <TimeRecommendation arrangerId="arranger-1" onSelect={onSelect} />,
    );

    expect(
      await screen.findByRole("button", { name: /Torsdag 18:00/ }),
    ).toBeDefined();
    expect(screen.getByRole("button", { name: /Mandag 18:00/ })).toBeDefined();
    expect(fetcher).toHaveBeenCalledWith(
      "/organizations/org-1/analytics?period=1y",
    );
  });

  it("selects the next matching date and the slot's start time on click", async () => {
    // Thursday 2026-08-20 at local noon: next Thursday evening is today.
    vi.useFakeTimers({
      now: new Date(2026, 7, 20, 12, 0, 0),
      toFake: ["Date"],
    });
    renderWithSwr(
      <TimeRecommendation arrangerId="arranger-1" onSelect={onSelect} />,
    );

    await userEvent.click(
      await screen.findByRole("button", { name: /Torsdag 18:00/ }),
    );
    expect(onSelect).toHaveBeenCalledWith("2026-08-20", "18:00");

    await userEvent.click(screen.getByRole("button", { name: /Mandag 18:00/ }));
    expect(onSelect).toHaveBeenCalledWith("2026-08-24", "18:00");
  });

  it("renders nothing for a personal arranger and never fetches", () => {
    renderWithSwr(
      <TimeRecommendation arrangerId="personal-arranger" onSelect={onSelect} />,
    );

    expect(screen.queryByText(/18:00/)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("renders nothing when the org has no event history", async () => {
    fetcher.mockResolvedValue({
      events: {
        byWeekday: analytics.events.byWeekday.map((bucket) => ({
          ...bucket,
          eventCount: 0,
        })),
        byTimeOfDay: [],
      },
    });

    const { container } = renderWithSwr(
      <TimeRecommendation arrangerId="arranger-1" onSelect={onSelect} />,
    );

    await vi.waitFor(() => expect(fetcher).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });

  it("renders nothing while loading or on error", () => {
    fetcher.mockRejectedValue(new Error("403"));
    const { container } = renderWithSwr(
      <TimeRecommendation arrangerId="arranger-1" onSelect={onSelect} />,
    );

    expect(container.textContent).toBe("");
  });
});
