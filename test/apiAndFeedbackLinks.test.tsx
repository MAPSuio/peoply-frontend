import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FAQ from "../pages/faq";
import Footer from "../components/Footer";
import Header from "../components/Header";
import ProfileMenu from "../components/ProfileMenu";

vi.mock("next/router", () => ({
  useRouter: () => ({
    query: {},
    push: vi.fn(),
    events: { on: vi.fn(), off: vi.fn() },
  }),
}));

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: undefined, logout: vi.fn() }),
}));
vi.mock("../hooks/useNotifications", () => ({
  default: () => ({ hasUnreadNotifications: false }),
}));
vi.mock("../hooks/useBack", () => ({ default: () => vi.fn() }));
vi.mock("../components/HeadComponent", () => ({ default: () => null }));

const hrefOf = (name: RegExp) =>
  screen.getByRole("link", { name }).getAttribute("href");

describe("API and feedback entry points", () => {
  it("offers the API docs from the front-page footer", () => {
    render(<Footer />);

    expect(hrefOf(/API for utviklere/i)).toBe("/integrasjoner");
  });

  it("offers the API docs from the profile menu", () => {
    render(<ProfileMenu />);

    expect(hrefOf(/^API$/)).toBe("/integrasjoner");
  });

  it("sends feedback from the FAQ contact section", () => {
    render(<FAQ />);

    expect(hrefOf(/^Feedback$/)).toBe("/feedback");
  });

  it("no longer crowds the header with those links", () => {
    render(<Header />);

    expect(
      screen.queryByRole("link", { name: /API/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /FAQ/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Feedback/i }),
    ).not.toBeInTheDocument();
  });
});
