import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AnnouncementBanner from "../components/AnnouncementBanner";

const ANNOUNCEMENT_KEY = "peoply-announcement:open-source-2026-07";

describe("AnnouncementBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the open source announcement with links to both repos", () => {
    render(<AnnouncementBanner />);

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Peoply er open source! 🎉",
    );
    expect(
      screen.getByRole("link", { name: /peoply-frontend/ }),
    ).toHaveAttribute("href", "https://github.com/MAPSuio/peoply-frontend");
    expect(
      screen.getByRole("link", { name: /peoply-backend/ }),
    ).toHaveAttribute("href", "https://github.com/MAPSuio/peoply-backend");
  });

  it("hides and remembers the choice once OK is pressed", async () => {
    const user = userEvent.setup();
    render(<AnnouncementBanner />);

    await user.click(
      screen.getByRole("button", {
        name: "Fy! Nå ble jeg gæssed på en pils 🎉",
      }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const storedValue = JSON.parse(
      window.localStorage.getItem(ANNOUNCEMENT_KEY) ?? "{}",
    );
    expect(storedValue.acknowledgedAt).toBeTruthy();
  });

  it("does not show again once acknowledged", () => {
    window.localStorage.setItem(
      ANNOUNCEMENT_KEY,
      JSON.stringify({
        firstSeenAt: new Date().toISOString(),
        acknowledgedAt: new Date().toISOString(),
      }),
    );

    render(<AnnouncementBanner />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("stays hidden after the announcement period is over", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2027-02-01T12:00:00.000Z"));

    render(<AnnouncementBanner />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(ANNOUNCEMENT_KEY)).toBeNull();
  });
});
