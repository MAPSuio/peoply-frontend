import { render, screen, waitFor } from "@testing-library/react";
import useSWR from "swr";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SwrProvider from "../components/SwrProvider";
import { ApiError } from "../services/apiError";

const addSnack = vi.fn();
vi.mock("../hooks/useSnack", () => ({ default: () => ({ addSnack }) }));

const fetchFromPeoplyApiJson = vi.fn();
vi.mock("../services/fetchers", async () => {
  const actual = await vi.importActual<typeof import("../services/fetchers")>(
    "../services/fetchers",
  );
  return {
    ...actual,
    fetchFromPeoplyApiJson: (...args: unknown[]) =>
      fetchFromPeoplyApiJson(...args),
  };
});

function Consumer() {
  const { error } = useSWR<string>("/events");
  return <span data-testid="error">{error ? "failed" : "-"}</span>;
}

const RETRY_WINDOW_MS = 120_000;

function renderConsumer() {
  return render(
    <SwrProvider>
      <Consumer />
    </SwrProvider>,
  );
}

describe("SWR error retries", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    addSnack.mockReset();
    fetchFromPeoplyApiJson.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not retry a rate-limited request", async () => {
    fetchFromPeoplyApiJson.mockRejectedValue(
      new ApiError("rate limited", 429, "/events"),
    );

    renderConsumer();
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("failed"),
    );
    await vi.advanceTimersByTimeAsync(RETRY_WINDOW_MS);

    expect(fetchFromPeoplyApiJson).toHaveBeenCalledTimes(1);
  });

  it("still retries a server error, up to the configured count", async () => {
    fetchFromPeoplyApiJson.mockRejectedValue(
      new ApiError("boom", 500, "/events"),
    );

    renderConsumer();
    await waitFor(() =>
      expect(screen.getByTestId("error")).toHaveTextContent("failed"),
    );
    await vi.advanceTimersByTimeAsync(RETRY_WINDOW_MS);

    expect(fetchFromPeoplyApiJson).toHaveBeenCalledTimes(4);
  });
});
