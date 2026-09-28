import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { API_URL } from "../constants/urls";
import Login from "../pages/login";

vi.mock("next/router", () => ({
  useRouter: () => ({ query: {}, push: vi.fn(), isReady: true }),
}));

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: undefined, loading: false }),
}));

describe("the Vipps migration notice on the login page", () => {
  it("sends Google linking through a Vipps login that lands on settings, and points to email login", () => {
    render(<Login />);

    expect(
      screen.getByText(/Vi migrerer Vipps til en ny avtale, midlertidig:/),
    ).toBeTruthy();
    const google = screen.getByRole("link", { name: "Google-konto" });
    expect(google.getAttribute("href")).toBe(`${API_URL}/auth/login`);
    fireEvent.click(google);
    expect(localStorage.getItem("redirectURL")).toBe("/me/settings");
    expect(screen.getByRole("link", { name: "her" }).getAttribute("href")).toBe(
      "/login/email",
    );
  });
});
