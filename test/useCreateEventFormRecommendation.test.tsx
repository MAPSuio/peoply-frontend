import { act, render, screen } from "@testing-library/react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useCreateEventForm from "../hooks/useCreateEventForm";

vi.mock("next/router", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn(), query: {} }),
}));
vi.mock("../hooks/useUser", () => ({
  default: () => ({
    user: { id: "user-1", arrangerId: "arranger-1" },
    orgs: [],
    loading: false,
  }),
}));
vi.mock("../hooks/useRedirectToLogin", () => ({ default: () => undefined }));
vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));

let apply: (date: string, time: string) => void;

function Consumer() {
  const { eventObject, applyRecommendedStart } = useCreateEventForm();
  apply = applyRecommendedStart;
  return (
    <p>
      {eventObject.eventDateStart}|{eventObject.eventTimeStart}
    </p>
  );
}

describe("useCreateEventForm applyRecommendedStart", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sets both start date and time in one update, and persists the draft", async () => {
    render(
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          fetcher: vi.fn().mockResolvedValue([]),
        }}
      >
        <Consumer />
      </SWRConfig>,
    );

    await act(async () => {
      apply("2026-08-27", "18:00");
    });

    expect(screen.getByText("2026-08-27|18:00")).toBeDefined();
    const draft = JSON.parse(localStorage.getItem("eventObject") ?? "{}");
    expect(draft.eventDateStart).toBe("2026-08-27");
    expect(draft.eventTimeStart).toBe("18:00");
  });
});
