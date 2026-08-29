import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useUser, { UserProvider } from "../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { fetchIpInfo } from "../services/ip";

vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApiJson: vi.fn(),
}));

vi.mock("../services/ip", () => ({
  fetchIpInfo: vi.fn(),
}));

function AuthState() {
  const { user, loading } = useUser();

  return <p>{loading ? "laster" : (user?.id ?? "ingen bruker")}</p>;
}

function renderProvider() {
  return render(
    <UserProvider>
      <AuthState />
    </UserProvider>,
  );
}

describe("UserProvider bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchIpInfo).mockResolvedValue(undefined as never);
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.trimStart().split("=")[0];
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });

  it("never asks the api who you are when no session marker is present", async () => {
    renderProvider();

    await screen.findByText("ingen bruker");
    expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
  });

  it("asks the api who you are when the session marker is present", async () => {
    document.cookie = "has_session=1; path=/";
    vi.mocked(fetchFromPeoplyApiJson).mockResolvedValueOnce({ id: "user-1" });

    renderProvider();

    await screen.findByText("user-1");
    await waitFor(() =>
      expect(fetchFromPeoplyApiJson).toHaveBeenCalledWith(
        "/users/me",
        expect.anything(),
      ),
    );
  });

  it("is not fooled by another cookie whose name ends the same way", async () => {
    document.cookie = "not_has_session=1; path=/";

    renderProvider();

    await screen.findByText("ingen bruker");
    expect(fetchFromPeoplyApiJson).not.toHaveBeenCalled();
  });
});
