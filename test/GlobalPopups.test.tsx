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

  it("falls back to the existing announcement when no popup is active", async () => {
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValueOnce(null);

    renderPopups();

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveAccessibleName(
        "Peoply er open source! 🎉",
      ),
    );
  });
});
