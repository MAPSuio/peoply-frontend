import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Login from "../pages/login";

vi.mock("next/router", () => ({
  useRouter: () => ({ query: {}, push: vi.fn(), isReady: true }),
}));

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: undefined, loading: false }),
}));

describe("the Vipps migration notice on the login page", () => {
  it("points to Google linking and to email login", () => {
    render(<Login />);

    expect(
      screen.getByText(/Vi migrerer Vipps til en ny avtale, midlertidig:/),
    ).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Google-konto" }).getAttribute("href"),
    ).toBe("/me/settings");
    expect(screen.getByRole("link", { name: "her" }).getAttribute("href")).toBe(
      "/login/email",
    );
  });
});
