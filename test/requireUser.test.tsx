import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RequireUser from "../components/RequireUser";
import type { User } from "../types/types";

const redirectToLogin = vi.fn();
vi.mock("../hooks/useRedirectToLogin", () => ({
  default: () => redirectToLogin,
}));

const session = vi.fn();
vi.mock("../hooks/useUser", () => ({
  default: () => session(),
}));

const ada = { id: "u1", firstName: "Ada" } as User;

describe("RequireUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows nothing and waits while the session is still being resolved", () => {
    session.mockReturnValue({ user: undefined, loading: true });

    const { container } = render(
      <RequireUser>{() => <p>krever innlogging</p>}</RequireUser>,
    );

    expect(container).toBeEmptyDOMElement();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to login without rendering the page", () => {
    session.mockReturnValue({ user: undefined, loading: false });

    const { container } = render(
      <RequireUser>{() => <p>krever innlogging</p>}</RequireUser>,
    );

    expect(redirectToLogin).toHaveBeenCalled();
    expect(container).toBeEmptyDOMElement();
  });

  it("hands the signed-in user to the page below it", () => {
    session.mockReturnValue({ user: ada, loading: false });

    render(<RequireUser>{(user) => <p>{user.firstName}</p>}</RequireUser>);

    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });
});
