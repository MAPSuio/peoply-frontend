import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SWRConfig } from "swr";

import useRegistrationCount from "../hooks/useRegistrationCount";
import type { Event } from "../types/types";

const fetcher = vi.fn();

function Consumer({ event }: { event?: Pick<Event, "id" | "goingCount"> }) {
  const { data, mutate } = useRegistrationCount(event);

  return (
    <>
      <span data-testid="count">{data === undefined ? "-" : String(data)}</span>
      <button type="button" onClick={() => void mutate()}>
        refresh
      </button>
    </>
  );
}

function renderHook(event?: Pick<Event, "id" | "goingCount">) {
  return render(
    /* `provider` gives each test its own cache, otherwise the first test's
       entry for an event id would satisfy the next one's render. */
    <SWRConfig value={{ fetcher, provider: () => new Map() }}>
      <Consumer event={event} />
    </SWRConfig>,
  );
}

describe("useRegistrationCount", () => {
  beforeEach(() => {
    fetcher.mockReset();
    fetcher.mockResolvedValue(7);
  });

  it("fetches when the event carries no goingCount", async () => {
    renderHook({ id: "event-1" } as Pick<Event, "id" | "goingCount">);

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

  it("does not fetch without an event", async () => {
    renderHook(undefined);

    expect(screen.getByTestId("count")).toHaveTextContent("-");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("treats a zero count as an answer, not as missing", async () => {
    renderHook({ id: "event-1", goingCount: 0 });

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetcher).not.toHaveBeenCalled();
  });
});
