import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import GlobalPopups from "../components/GlobalPopups";
import { fetchFromPeoplyApiJson } from "../services/fetchers";

vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApiJson: vi.fn(),
}));

const popup = {
  id: "popup-1",
  title: "Viktig beskjed",
  body: "Første avsnitt.\n\nAndre avsnitt.",
  startsAt: "2026-08-15T10:00:00.000Z",
  endsAt: "2026-08-15T12:00:00.000Z",
  createdAt: "2026-08-14T10:00:00.000Z",
  updatedAt: "2026-08-14T10:00:00.000Z",
};

function renderPopups() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <GlobalPopups />
    </SWRConfig>,
  );
}

describe("GlobalPopups", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the scheduled popup as separate paragraphs", async () => {
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValueOnce(popup);

    renderPopups();

    expect(await screen.findByRole("dialog")).toHaveAccessibleName(
      "Viktig beskjed",
    );
    expect(screen.getByText("Første avsnitt.")).toBeInTheDocument();
    expect(screen.getByText("Andre avsnitt.")).toBeInTheDocument();
    expect(screen.queryByText(/open source/i)).not.toBeInTheDocument();
  });

  it("remembers dismissal per popup id", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValueOnce(popup);

    renderPopups();
    const closeButton = (await screen.findByText("Lukk")).closest("button");
    expect(closeButton).not.toBeNull();
    if (!closeButton) return;
    await user.click(closeButton);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("peoply-popup:popup-1")).toBe(
      "acknowledged",
    );
  });

  it("shows no dialog when nothing is scheduled", async () => {
    /* GET /popups/active answers "nothing scheduled" with an empty body, which
       the fetcher reports as undefined. There is no hardcoded announcement to
       fall back to - every announcement is a scheduled popup. */
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(undefined);

    renderPopups();

    await waitFor(() =>
      expect(vi.mocked(fetchFromPeoplyApiJson)).toHaveBeenCalled(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows no dialog when the lookup fails", async () => {
    vi.mocked(fetchFromPeoplyApiJson).mockRejectedValue(new Error("offline"));

    renderPopups();

    await waitFor(() =>
      expect(vi.mocked(fetchFromPeoplyApiJson)).toHaveBeenCalled(),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("GlobalPopups analytics", () => {
  const track = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    track.mockClear();
    window.umami = { track };
  });

  it("reports a popup as seen when it reaches the screen", async () => {
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(popup);

    renderPopups();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith("popup-vist", {
      id: "popup-1",
      title: "Viktig beskjed",
    });
  });

  it("counts a popup once per browser, not once per page view", async () => {
    /* It reappears on every page load until dismissed, so an event per
       display would measure page views rather than people. */
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(popup);

    const first = renderPopups();
    await screen.findByRole("dialog");
    first.unmount();

    renderPopups();
    await screen.findByRole("dialog");

    expect(
      track.mock.calls.filter(([name]) => name === "popup-vist"),
    ).toHaveLength(1);
  });

  it("reports the dismissal separately, for a dismissal rate", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(popup);

    renderPopups();
    const closeButton = (await screen.findByText("Lukk")).closest("button");
    if (!closeButton) throw new Error("no close button");
    await user.click(closeButton);

    expect(track).toHaveBeenCalledWith("popup-lukket", {
      id: "popup-1",
      title: "Viktig beskjed",
    });
  });

  it("does not report an already dismissed popup as seen again", async () => {
    window.localStorage.setItem("peoply-popup:popup-1", "acknowledged");
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(popup);

    renderPopups();

    await waitFor(() => expect(fetchFromPeoplyApiJson).toHaveBeenCalled());
    expect(track).not.toHaveBeenCalled();
  });

  it("survives a missing tracker", async () => {
    /* Content blockers drop the script for a large share of users; the popup
       still has to render. */
    window.umami = undefined;
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValue(popup);

    renderPopups();

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
