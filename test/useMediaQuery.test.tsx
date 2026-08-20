import { act, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useIsDesktop, useMediaQuery } from "../hooks/useMediaQuery";

type Listener = () => void;

function stubMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners = new Set<Listener>();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_: "change", listener: Listener) => {
        listeners.add(listener);
      },
      removeEventListener: (_: "change", listener: Listener) => {
        listeners.delete(listener);
      },
    })),
  );

  return {
    setMatches(next: boolean) {
      matches = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

function QueryConsumer({ query }: { query: string }) {
  return <p>{useMediaQuery(query) ? "matches" : "no match"}</p>;
}

function DesktopConsumer() {
  return <p>{useIsDesktop() ? "desktop" : "mobile"}</p>;
}

describe("useMediaQuery", () => {
  it("reflects the current match state", () => {
    stubMatchMedia(false);
    render(<QueryConsumer query="(min-width: 600px)" />);
    expect(screen.getByText("no match")).toBeDefined();
  });

  it("updates when the media query change event fires", () => {
    const media = stubMatchMedia(false);
    render(<QueryConsumer query="(min-width: 600px)" />);

    act(() => {
      media.setMatches(true);
    });

    expect(screen.getByText("matches")).toBeDefined();
  });

  it("useIsDesktop matches the shared 600px breakpoint", () => {
    stubMatchMedia(true);
    render(<DesktopConsumer />);

    expect(screen.getByText("desktop")).toBeDefined();
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 600px)");
  });
});
