import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import EventPage from "../pages/events/[eid]/index";
import { type Event, EventRegistrationMode, Visibility } from "../types/types";

let currentUser: { id: string; arrangerId: string } | undefined;

vi.mock("next/router", () => {
  const router = { push: vi.fn(), replace: vi.fn(), back: vi.fn(), query: {} };
  return { default: router, useRouter: () => router };
});
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));
vi.mock("swr", () => ({
  default: (
    _key: unknown,
    _fetcher?: unknown,
    opts?: { fallbackData?: unknown },
  ) => ({
    data: opts?.fallbackData,
    mutate: vi.fn(),
  }),
}));
vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: currentUser, orgs: [] }),
}));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../hooks/useEventFavorite", () => ({
  default: () => ({
    favorited: false,
    loading: false,
    toggleFavorite: vi.fn(),
  }),
}));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));
vi.mock("../components/CoOrganizerInvitationBanner", () => ({
  default: () => null,
}));
vi.mock("../components/AddToCalendarButton", () => ({ default: () => null }));

function eventWith(visibility: Visibility): Event {
  return {
    id: "event-1",
    urlId: "ABCDEFGH",
    title: "Quiz",
    description: "",
    startDate: "2026-11-01T18:00:00.000Z",
    endDate: "2026-11-01T20:00:00.000Z",
    visibility,
    registrationMode: EventRegistrationMode.PEOPLY,
    eventArrangers: [
      {
        arrangerId: "arranger-owner",
        arranger: { user: { id: "owner", name: "Owner" } },
      },
    ],
  } as unknown as Event;
}

const INVITE = "Inviter brukere";

describe("invite button on the event page", () => {
  beforeEach(() => {
    currentUser = { id: "u1", arrangerId: "arranger-guest" };
  });

  it("shows for a non-arranger on a public event", () => {
    render(<EventPage event={eventWith(Visibility.PUBLIC)} />);
    expect(screen.queryAllByText(INVITE).length).toBeGreaterThan(0);
  });

  it("shows for a non-arranger on an unlisted event", () => {
    render(<EventPage event={eventWith(Visibility.UNLISTED)} />);
    expect(screen.queryAllByText(INVITE).length).toBeGreaterThan(0);
  });

  it("is hidden for a non-arranger on a private event", () => {
    render(<EventPage event={eventWith(Visibility.PRIVATE)} />);
    expect(screen.queryAllByText(INVITE)).toHaveLength(0);
  });

  it("shows for the arranger on a private event", () => {
    currentUser = { id: "u1", arrangerId: "arranger-owner" };
    render(<EventPage event={eventWith(Visibility.PRIVATE)} />);
    expect(screen.queryAllByText(INVITE).length).toBeGreaterThan(0);
  });
});
