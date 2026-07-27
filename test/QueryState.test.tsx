import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import QueryState from "../components/QueryState";

vi.mock("../components/LoadingWheel", () => ({
  default: () => <div data-testid="loading-wheel" />,
}));

describe("QueryState", () => {
  it("shows the loading wheel while the query has neither data nor an error", () => {
    render(
      <QueryState query={{ data: undefined, error: undefined }}>
        {() => <p>never</p>}
      </QueryState>,
    );

    expect(screen.getByTestId("loading-wheel")).toBeInTheDocument();
    expect(screen.queryByText("never")).not.toBeInTheDocument();
  });

  it("shows the loading wheel when isLoading is true, even with stale data around", () => {
    render(
      <QueryState
        query={{ data: ["stale"], error: undefined, isLoading: true }}
      >
        {(data) => <p>{data.join(",")}</p>}
      </QueryState>,
    );

    expect(screen.getByTestId("loading-wheel")).toBeInTheDocument();
    expect(screen.queryByText("stale")).not.toBeInTheDocument();
  });

  it("renders the standard Norwegian error message once the query fails", () => {
    render(
      <QueryState query={{ data: undefined, error: new Error("boom") }}>
        {() => <p>never</p>}
      </QueryState>,
    );

    expect(
      screen.getByText("Kunne ikke hente dataen. Prøv igjen om litt."),
    ).toBeInTheDocument();
    expect(screen.queryByText("never")).not.toBeInTheDocument();
  });

  it("lets a call site override the error message", () => {
    render(
      <QueryState
        query={{ data: undefined, error: new Error("boom") }}
        errorMessage="Kunne ikke laste kalenderen. Prøv igjen om litt."
      >
        {() => null}
      </QueryState>,
    );

    expect(
      screen.getByText("Kunne ikke laste kalenderen. Prøv igjen om litt."),
    ).toBeInTheDocument();
  });

  it("hides the retry button when the query doesn't provide mutate", () => {
    render(
      <QueryState query={{ data: undefined, error: new Error("boom") }}>
        {() => null}
      </QueryState>,
    );

    expect(
      screen.queryByRole("button", { name: "Prøv igjen" }),
    ).not.toBeInTheDocument();
  });

  it("calls mutate when the retry button is pressed", async () => {
    const mutate = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryState query={{ data: undefined, error: new Error("boom"), mutate }}>
        {() => null}
      </QueryState>,
    );

    await user.click(screen.getByRole("button", { name: "Prøv igjen" }));

    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("renders the children once data has arrived", () => {
    render(
      <QueryState query={{ data: "hello", error: undefined }}>
        {(data) => <p>{data}</p>}
      </QueryState>,
    );

    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-wheel")).not.toBeInTheDocument();
  });

  it("prioritizes the error state over stale data left over from a previous fetch", () => {
    render(
      <QueryState query={{ data: "stale", error: new Error("boom") }}>
        {(data) => <p>{data}</p>}
      </QueryState>,
    );

    expect(screen.queryByText("stale")).not.toBeInTheDocument();
    expect(
      screen.getByText("Kunne ikke hente dataen. Prøv igjen om litt."),
    ).toBeInTheDocument();
  });
});
