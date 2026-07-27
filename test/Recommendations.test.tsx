import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { describe, expect, it, vi } from "vitest";

import Recommendations from "../components/Recommendations";
import type { Event, Organization } from "../types/types";

/* The real cards pull in images, icons and their own data hooks, which have no
   business in this test. The component under test only decides what to feed
   them and in what order. */
vi.mock("../components/EventCard", () => ({
  default: ({ event }: { event: Event }) => <span>{event.title}</span>,
}));

vi.mock("../components/OrganizationAvatar", () => ({
  default: ({ organization }: { organization: Organization }) => (
    <span>{organization.name}</span>
  ),
}));

const EVENT = { id: "e1", urlId: "e1", title: "Kodekveld" } as Event;
const ORG = { id: "o1", name: "MAPS" } as Organization;

/* Renders against a fetcher the test controls, with a cache of its own so one
   test's answer never leaks into the next. */
function renderWithFetcher(fetcher: (key: string) => Promise<unknown>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig
      value={{
        fetcher,
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
  return render(<Recommendations />, { wrapper });
}

describe("Recommendations", () => {
  it("renders recommended events and organizations", async () => {
    renderWithFetcher(async (key) =>
      key.startsWith("/recommendations/events") ? [EVENT] : [ORG],
    );

    expect(await screen.findByText("Anbefalt for deg")).toBeInTheDocument();
    expect(screen.getByText("Kodekveld")).toBeInTheDocument();
    expect(screen.getByText("Foreninger du kanskje liker")).toBeInTheDocument();
    expect(screen.getByText("MAPS")).toBeInTheDocument();
  });

  it("interleaves the organization strip after the first three events", async () => {
    const events = ["Ett", "To", "Tre", "Fire"].map(
      (title, i) => ({ id: `e${i}`, urlId: `e${i}`, title }) as Event,
    );
    renderWithFetcher(async (key) =>
      key.startsWith("/recommendations/events") ? events : [ORG],
    );

    await screen.findByText("Anbefalt for deg");
    const feedTexts = [...document.querySelectorAll("span")].map(
      (span) => span.textContent,
    );
    expect(feedTexts).toEqual(["Ett", "To", "Tre", "MAPS", "Fire"]);
  });

  it("renders only the section that has recommendations", async () => {
    renderWithFetcher(async (key) =>
      key.startsWith("/recommendations/events") ? [EVENT] : [],
    );

    expect(await screen.findByText("Anbefalt for deg")).toBeInTheDocument();
    expect(
      screen.queryByText("Foreninger du kanskje liker"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when there is nothing to recommend", async () => {
    const fetcher = vi.fn(async () => []);
    const { container } = renderWithFetcher(fetcher);

    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
    expect(container).toBeEmptyDOMElement();
  });
});
