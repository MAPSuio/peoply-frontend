import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useUser, { UserProvider } from "../hooks/useUser";
import { deleteMe, logout } from "../services/auth";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { fetchIpInfo } from "../services/ip";

vi.mock("../services/fetchers", () => ({
  fetchFromPeoplyApiJson: vi.fn(),
}));

vi.mock("../services/ip", () => ({
  fetchIpInfo: vi.fn(),
}));

vi.mock("../services/auth", () => ({
  logout: vi.fn(),
  deleteMe: vi.fn(),
}));

const PRECACHE_NAME = "serwist-precache-v2-https://peoply.app/";

function AccountExit() {
  const {
    user,
    loading,
    logout: exitSession,
    deleteMe: removeAccount,
  } = useUser();

  return (
    <>
      <p>{loading ? "laster" : (user?.id ?? "ingen bruker")}</p>
      <button
        type="button"
        onClick={() => {
          exitSession().catch(() => undefined);
        }}
      >
        logg ut
      </button>
      <button
        type="button"
        onClick={() => {
          removeAccount().catch(() => undefined);
        }}
      >
        slett konto
      </button>
    </>
  );
}

function cacheStorageWith(cacheNames: string[]) {
  return {
    keys: vi.fn(async () => cacheNames),
    delete: vi.fn(async () => true),
  };
}

async function renderSignedInAccountExit(cacheNames: string[]) {
  document.cookie = "has_session=1; path=/";
  vi.mocked(fetchFromPeoplyApiJson).mockResolvedValueOnce({ id: "user-1" });
  const cacheStorage = cacheStorageWith(cacheNames);
  vi.stubGlobal("caches", cacheStorage);

  render(
    <UserProvider>
      <AccountExit />
    </UserProvider>,
  );

  await screen.findByText("user-1");

  return cacheStorage;
}

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

describe("UserProvider account exit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchIpInfo).mockResolvedValue(undefined as never);
    vi.mocked(logout).mockResolvedValue(new Response());
    vi.mocked(deleteMe).mockResolvedValue(new Response());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps the serwist precache when logging out", async () => {
    const cacheStorage = await renderSignedInAccountExit([
      PRECACHE_NAME,
      "apis",
    ]);

    await userEvent.click(screen.getByRole("button", { name: "logg ut" }));

    await screen.findByText("ingen bruker");
    expect(logout).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith("apis");
    expect(cacheStorage.delete).not.toHaveBeenCalledWith(PRECACHE_NAME);
  });

  it("clears the session and the runtime caches when logout fails", async () => {
    vi.mocked(logout).mockRejectedValueOnce(new Error("offline"));
    const cacheStorage = await renderSignedInAccountExit([
      PRECACHE_NAME,
      "apis",
    ]);

    await userEvent.click(screen.getByRole("button", { name: "logg ut" }));

    await screen.findByText("ingen bruker");
    expect(logout).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith("apis");
  });

  it("clears the session and the runtime caches when account deletion fails", async () => {
    vi.mocked(deleteMe).mockRejectedValueOnce(new Error("offline"));
    const cacheStorage = await renderSignedInAccountExit([
      PRECACHE_NAME,
      "apis",
    ]);

    await userEvent.click(screen.getByRole("button", { name: "slett konto" }));

    await screen.findByText("ingen bruker");
    expect(deleteMe).toHaveBeenCalledTimes(1);
    expect(cacheStorage.delete).toHaveBeenCalledWith("apis");
  });
});
