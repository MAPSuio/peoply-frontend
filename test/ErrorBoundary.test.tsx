import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "../components/ErrorBoundary";

/* ErrorBoundary listens for routeChangeComplete to reset itself on
   navigation - it doesn't need a real Next.js router to do that. */
vi.mock("next/router", () => ({
  useRouter: () => ({
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

function Bomb(): null {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>alt bra</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("alt bra")).toBeInTheDocument();
  });

  it("renders the fallback with a reload button when a child throws", () => {
    /* React logs the caught error to console.error on top of our own
       componentDidCatch call - silence it so the test output stays about the
       assertion, not the expected crash. */
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Oisann, noe gikk galt")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Last inn siden på nytt" }),
    ).toBeInTheDocument();
  });

  it("reloads the page when the reload button is pressed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const reload = vi.fn();
    const originalLocation = window.location;
    // jsdom's window.location.reload is a non-configurable no-op, so it
    // can't be spied on directly - replace the whole object instead.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload },
    });
    const user = userEvent.setup();

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    await user.click(
      screen.getByRole("button", { name: "Last inn siden på nytt" }),
    );

    expect(reload).toHaveBeenCalledTimes(1);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });
});
