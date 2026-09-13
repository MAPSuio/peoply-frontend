import { act, render, screen, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useEventFavorite from "../hooks/useEventFavorite";

const signedInUser = { id: "user-1" };
const userState: { user: { id: string } | undefined; loading: boolean } = {
  user: signedInUser,
  loading: false,
};

vi.mock("../hooks/useUser", () => ({ default: () => userState }));

const addSnack = vi.fn();
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));

const redirectToLogin = vi.fn();
vi.mock("../hooks/useRedirectToLogin", () => ({
  default: () => redirectToLogin,
}));

const addFavorite = vi.fn();
const removeFavorite = vi.fn();
vi.mock("../services/events", () => ({
  addFavorite: (...args: unknown[]) => addFavorite(...args),
  removeFavorite: (...args: unknown[]) => removeFavorite(...args),
}));

const fetchAllFromPeoplyApiJson = vi.fn();
vi.mock("../services/fetchers", async () => {
  const actual = await vi.importActual<typeof import("../services/fetchers")>(
    "../services/fetchers",
  );
  return {
    ...actual,
    fetchAllFromPeoplyApiJson: (...args: unknown[]) =>
      fetchAllFromPeoplyApiJson(...args),
  };
});

const favoritedEventId = "event-2";
const feedEventIds = ["event-1", favoritedEventId, "event-3", "event-4"];

function Heart({ eventId }: { eventId: string }) {
  const { favorited, loading, toggleFavorite } = useEventFavorite(eventId);

  return (
    <button
      type="button"
      data-testid={eventId}
      data-favorited={favorited}
      data-loading={loading}
      onClick={() => void toggleFavorite()}
    >
      {eventId}
    </button>
  );
}

function renderFeed(eventIds: string[] = feedEventIds) {
  return render(
    <SWRConfig value={{ fetcher: vi.fn(), provider: () => new Map() }}>
      {eventIds.map((eventId) => (
        <Heart key={eventId} eventId={eventId} />
      ))}
    </SWRConfig>,
  );
}

const favoritedFlagOf = (eventId: string) =>
  screen.getByTestId(eventId).getAttribute("data-favorited");

const loadingFlagOf = (eventId: string) =>
  screen.getByTestId(eventId).getAttribute("data-loading");

describe("useEventFavorite", () => {
  beforeEach(() => {
    userState.user = signedInUser;
    userState.loading = false;
    addSnack.mockReset();
    redirectToLogin.mockReset();
    addFavorite.mockReset().mockResolvedValue(true);
    removeFavorite.mockReset().mockResolvedValue(true);
    fetchAllFromPeoplyApiJson.mockReset().mockResolvedValue([
      {
        userId: "user-1",
        eventId: favoritedEventId,
        favoritedDate: new Date(2026, 6, 1).toISOString(),
      },
    ]);
  });

  it("asks for the user's favorites once for a whole feed, not once per card", async () => {
    renderFeed();

    await waitFor(() =>
      expect(fetchAllFromPeoplyApiJson).toHaveBeenCalledTimes(1),
    );
    expect(fetchAllFromPeoplyApiJson).toHaveBeenCalledWith(
      "/users/user-1/favorites",
    );
  });

  it("marks exactly the events the answer names", async () => {
    renderFeed();

    await waitFor(() => expect(favoritedFlagOf("event-1")).toBe("false"));
    expect(favoritedFlagOf(favoritedEventId)).toBe("true");
    expect(favoritedFlagOf("event-3")).toBe("false");
  });

  it("holds the heart disabled until the answer is in", async () => {
    let resolveFavorites: (favorites: unknown[]) => void = vi.fn();
    fetchAllFromPeoplyApiJson.mockReturnValue(
      new Promise((resolve) => {
        resolveFavorites = resolve;
      }),
    );

    renderFeed(["event-1"]);

    expect(loadingFlagOf("event-1")).toBe("true");

    await act(async () => {
      resolveFavorites([]);
    });

    await waitFor(() => expect(loadingFlagOf("event-1")).toBe("false"));
  });

  it("does not fetch for a signed-out visitor", async () => {
    userState.user = undefined;

    renderFeed();

    await waitFor(() => expect(loadingFlagOf("event-1")).toBe("false"));
    expect(fetchAllFromPeoplyApiJson).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to log in instead of favoriting", async () => {
    userState.user = undefined;

    renderFeed(["event-1"]);
    await act(async () => {
      screen.getByTestId("event-1").click();
    });

    expect(redirectToLogin).toHaveBeenCalledTimes(1);
    expect(addFavorite).not.toHaveBeenCalled();
  });

  it("adds a favorite without asking for the list again", async () => {
    renderFeed(["event-1"]);
    await waitFor(() => expect(favoritedFlagOf("event-1")).toBe("false"));

    await act(async () => {
      screen.getByTestId("event-1").click();
    });

    expect(addFavorite).toHaveBeenCalledWith("user-1", "event-1");
    await waitFor(() => expect(favoritedFlagOf("event-1")).toBe("true"));
    expect(fetchAllFromPeoplyApiJson).toHaveBeenCalledTimes(1);
  });

  it("removes a favorite the list already holds", async () => {
    renderFeed([favoritedEventId]);
    await waitFor(() => expect(favoritedFlagOf(favoritedEventId)).toBe("true"));

    await act(async () => {
      screen.getByTestId(favoritedEventId).click();
    });

    expect(removeFavorite).toHaveBeenCalledWith("user-1", favoritedEventId);
    await waitFor(() =>
      expect(favoritedFlagOf(favoritedEventId)).toBe("false"),
    );
  });

  it("moves every card showing the same event, not only the one clicked", async () => {
    renderFeed(["event-1", "event-1"]);
    await waitFor(() =>
      expect(screen.getAllByTestId("event-1")[0]).toHaveAttribute(
        "data-favorited",
        "false",
      ),
    );

    await act(async () => {
      screen.getAllByTestId("event-1")[0].click();
    });

    await waitFor(() =>
      expect(screen.getAllByTestId("event-1")[1]).toHaveAttribute(
        "data-favorited",
        "true",
      ),
    );
  });

  it("keeps the heart where it was when the write fails", async () => {
    addFavorite.mockResolvedValue(false);

    renderFeed(["event-1"]);
    await waitFor(() => expect(favoritedFlagOf("event-1")).toBe("false"));

    await act(async () => {
      screen.getByTestId("event-1").click();
    });

    expect(addSnack).toHaveBeenCalledTimes(1);
    expect(favoritedFlagOf("event-1")).toBe("false");
  });

  it("frees the heart when the list cannot be read", async () => {
    fetchAllFromPeoplyApiJson.mockRejectedValue(new Error("network down"));

    renderFeed(["event-1"]);

    await waitFor(() => expect(loadingFlagOf("event-1")).toBe("false"));
    expect(favoritedFlagOf("event-1")).toBe("false");
  });
});
