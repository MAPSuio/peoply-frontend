import { render, screen, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import OrganizationAnalytics from "../components/organization/OrganizationAnalytics";
import type {
  Organization,
  OrganizationAnalytics as OrganizationAnalyticsPayload,
} from "../types/types";

let isDesktop = false;

vi.mock("../hooks/useMediaQuery", () => ({
  useIsDesktop: () => isDesktop,
  useMediaQuery: () => isDesktop,
}));

/* The charts are dynamically imported (ssr: false) and render SVG that jsdom
   cannot measure, so the dynamic boundary is stubbed out. */
vi.mock("next/dynamic", () => ({
  default: () => {
    const Charts = () => <div data-testid="charts" />;
    return Charts;
  },
}));

const organization = { id: "org-1", name: "MAPS" } as Organization;

const payload: OrganizationAnalyticsPayload = {
  generatedAt: "2026-08-20T12:00:00.000Z",
  period: "1y",
  followers: {
    total: 120,
    net24h: 1,
    net7d: 5,
    net30d: 12,
    netPeriod: 5,
    gross30d: 14,
    dailyNet: [{ date: "2026-08-20", net: 1 }],
  },
  members: { total: 30, newInPeriod: 3 },
  events: {
    items: [
      {
        id: "e1",
        urlId: "e1",
        title: "Kveldskurs",
        startDate: "2026-08-13T17:00:00.000Z",
        capacity: 10,
        goingCount: 8,
        waitlistedCount: 2,
        fillRate: 0.8,
      },
      {
        id: "e2",
        urlId: "e2",
        title: "Morgentrening",
        startDate: "2026-08-18T08:00:00.000Z",
        capacity: 2,
        goingCount: 2,
        waitlistedCount: 0,
        fillRate: 1,
      },
    ],
    totalGoing: 10,
    totalWaitlisted: 2,
    averageGoing: 5,
    averageFillRate: 0.9,
    soldOutRate: 0.5,
    medianDemand: 6,
    medianSignupLeadDays: 7,
    lastMinuteShare: 0.4,
    medianPublishLeadDays: 10,
    dropoutRate: 1 / 6,
    byWeekday: [
      { weekday: 0, averageGoing: 0, eventCount: 0 },
      { weekday: 1, averageGoing: 2, eventCount: 1 },
      { weekday: 2, averageGoing: 0, eventCount: 0 },
      { weekday: 3, averageGoing: 8, eventCount: 1 },
      { weekday: 4, averageGoing: 0, eventCount: 0 },
      { weekday: 5, averageGoing: 0, eventCount: 0 },
      { weekday: 6, averageGoing: 0, eventCount: 0 },
    ],
    byTimeOfDay: [
      { bucket: "MORNING", averageGoing: 2, eventCount: 1 },
      { bucket: "AFTERNOON", averageGoing: 0, eventCount: 0 },
      { bucket: "EVENING", averageGoing: 8, eventCount: 1 },
    ],
  },
  audience: {
    uniqueAttendees: 9,
    returningAttendeeRate: 2 / 3,
    coreAudienceCount: 2,
    attendeeFollowerRate: 1 / 3,
  },
};

const fetcher = vi.fn();

function renderWithSwr(ui: ReactElement) {
  return render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        fetcher,
      }}
    >
      {ui}
    </SWRConfig>,
  );
}

describe("OrganizationAnalytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isDesktop = false;
    fetcher.mockResolvedValue(payload);
  });

  it("fetches the analytics payload and renders the KPI values", async () => {
    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    expect(await screen.findByText("120")).toBeDefined();
    expect(fetcher).toHaveBeenCalledWith(
      "/organizations/org-1/analytics?period=1y",
    );
    expect(screen.getByText("Følgere")).toBeDefined();
    expect(screen.getByText("+5")).toBeDefined();
    expect(screen.getByText("Medlemmer")).toBeDefined();
    // soldOutRate 0.5 under a label anyone understands.
    expect(screen.getByText("Arrangementer som ble fulle")).toBeDefined();
    expect(screen.getByText("50 %")).toBeDefined();
    expect(screen.getByText("7 d før")).toBeDefined();
    expect(screen.getByText("Tor kveld")).toBeDefined();
  });

  it("renders the top events by attendance with signup counts", async () => {
    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    expect(await screen.findByText("Kveldskurs")).toBeDefined();
    expect(screen.getByText("Morgentrening")).toBeDefined();
    expect(screen.getByText("Mest populære")).toBeDefined();
    expect(screen.getByText("8 påmeldte")).toBeDefined();
  });

  it("refetches with the chosen period from the dropdown", async () => {
    const { userEvent } = await import("@testing-library/user-event").then(
      (module) => ({ userEvent: module.default }),
    );
    renderWithSwr(<OrganizationAnalytics organization={organization} />);
    await screen.findByText("120");

    await userEvent.selectOptions(
      screen.getByRole("combobox"),
      "Siste 7 dager",
    );

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(
        "/organizations/org-1/analytics?period=7d",
      );
    });
  });

  it("does not render charts on mobile", async () => {
    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    await screen.findByText("120");
    expect(screen.queryByTestId("charts")).toBeNull();
  });

  it("renders charts on desktop", async () => {
    isDesktop = true;
    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    await screen.findByText("120");
    expect(screen.getByTestId("charts")).toBeDefined();
  });

  it("renders missing metrics as an em dash", async () => {
    fetcher.mockResolvedValue({
      ...payload,
      events: {
        ...payload.events,
        items: [],
        averageGoing: null,
        averageFillRate: null,
        soldOutRate: null,
        medianDemand: null,
        medianSignupLeadDays: null,
        lastMinuteShare: null,
        medianPublishLeadDays: null,
        dropoutRate: null,
      },
      audience: {
        uniqueAttendees: 0,
        returningAttendeeRate: null,
        coreAudienceCount: 0,
        attendeeFollowerRate: null,
      },
    });

    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    await screen.findByText("120");
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows the shared error state when the request fails", async () => {
    fetcher.mockRejectedValue(new Error("boom"));

    renderWithSwr(<OrganizationAnalytics organization={organization} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeDefined();
    });
  });
});
