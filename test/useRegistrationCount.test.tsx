import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SWRConfig } from "swr";

import useRegistrationCount from "../hooks/useRegistrationCount";
import { type Event, EventRegistrationMode } from "../types/types";

const fetcher = vi.fn();

function Consumer({
  event,
  forDisplay,
}: {
  event?: Pick<Event, "id" | "goingCount" | "registrationMode">;
  forDisplay?: boolean;
}) {
  const { data, mutate } = useRegistrationCount(event, { forDisplay });

  return (
    <>
      <span data-testid="count">{data === undefined ? "-" : String(data)}</span>
      <button type="button" onClick={() => void mutate()}>
        refresh
      </button>
    </>
  );
}

function renderHook(
  event?: Pick<Event, "id" | "goingCount" | "registrationMode">,
  forDisplay?: boolean,
) {
  return render(
    /* `provider` gives each test its own cache, otherwise the first test's
       entry for an event id would satisfy the next one's render. */
    /* focusThrottleInterval 0: SWR's 5s focus throttle would otherwise
       swallow the dispatched focus events and let the focus tests pass
       whether or not the hook opts out of focus revalidation. */
    <SWRConfig
      value={{ fetcher, provider: () => new Map(), focusThrottleInterval: 0 }}
    >
      <Consumer event={event} forDisplay={forDisplay} />
    </SWRConfig>,
  );
}

describe("useRegistrationCount", () => {
  beforeEach(() => {
    fetcher.mockReset();
    fetcher.mockResolvedValue(7);
  });

  it("fetches when the event carries no goingCount", async () => {
    renderHook({ id: "event-1" } as Pick<
      Event,
      "id" | "goingCount" | "registrationMode"
    >);

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("7"),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith(
      "/events/event-1/registration-count?regStatus=GOING",
    );
  });

  /* The whole point of the change: a card rendered from a list response
     already holds the number, so it must not spend a request on it. */
  it("uses goingCount from the event and issues no request", async () => {
    renderHook({ id: "event-1", goingCount: 3 });

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).not.toHaveBeenCalled();
  });

  /* Seeding must not freeze the number. Joining or leaving from the card
     calls mutate(), and the count has to move. */
  it("revalidates on mutate even when seeded", async () => {
    renderHook({ id: "event-1", goingCount: 3 });

    expect(screen.getByTestId("count")).toHaveTextContent("3");

    await act(async () => {
      screen.getByRole("button", { name: "refresh" }).click();
    });

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("7"),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  /* A feed holds one of these per card, and SWR's default refetches every
     mounted key each time the app regains focus. On mobile that is every
     app switch, so the seeded number must stay quiet on focus and move only
     through mutate(). */
  it("does not refetch when the window regains focus", async () => {
    renderHook({ id: "event-1", goingCount: 3 });

    expect(screen.getByTestId("count")).toHaveTextContent("3");
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("fetches once for an unseeded event, focus or not", async () => {
    renderHook({ id: "event-1" } as Pick<
      Event,
      "id" | "goingCount" | "registrationMode"
    >);

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("7"),
    );
    await act(async () => {
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
      await new Promise((resolve) => setTimeout(resolve, 50));
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("does not fetch without an event", async () => {
    renderHook(undefined);

    expect(screen.getByTestId("count")).toHaveTextContent("-");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).not.toHaveBeenCalled();
  });

  /* External registration happens off Peoply, so whatever we hold is not the
     turnout. The hook is the last line of defence: a caller that forgets to
     hide its own markup must still have nothing to print. */
  describe("with external registration", () => {
    it("reports no count even when the event carries one", async () => {
      renderHook({
        id: "event-1",
        goingCount: 42,
        registrationMode: EventRegistrationMode.EXTERNAL,
      });

      expect(screen.getByTestId("count")).toHaveTextContent("-");
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("does not fetch a count it would not show", async () => {
      renderHook({
        id: "event-1",
        registrationMode: EventRegistrationMode.EXTERNAL,
      } as Pick<Event, "id" | "goingCount" | "registrationMode">);

      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(screen.getByTestId("count")).toHaveTextContent("-");
      expect(fetcher).not.toHaveBeenCalled();
    });

    it("stays empty across a mutate", async () => {
      renderHook({
        id: "event-1",
        goingCount: 42,
        registrationMode: EventRegistrationMode.EXTERNAL,
      });

      await act(async () => {
        screen.getByRole("button", { name: "refresh" }).click();
      });

      await waitFor(() =>
        expect(screen.getByTestId("count")).toHaveTextContent("-"),
      );
      expect(fetcher).not.toHaveBeenCalled();
    });

    /* The edit page needs the number to keep capacity above the people
       already registered, and that floor must survive the switch to external
       registration - it is not something we print, it is something we
       enforce. */
    it("still answers a caller that is not going to show it", async () => {
      renderHook(
        {
          id: "event-1",
          goingCount: 42,
          registrationMode: EventRegistrationMode.EXTERNAL,
        },
        false,
      );

      expect(screen.getByTestId("count")).toHaveTextContent("42");
    });
  });

  it("treats a zero count as an answer, not as missing", async () => {
    renderHook({ id: "event-1", goingCount: 0 });

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).not.toHaveBeenCalled();
  });
});
