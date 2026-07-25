import { render, screen } from "@testing-library/react";
import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Following from "../pages/me/following";
import { ArrangerFollower, User } from "../types/types";

const USER = { id: "u1", firstName: "Kari" } as User;
const EMPTY_STATE = /ikke følger noen arrangører/;

const push = vi.fn();
let currentUser: User | undefined = USER;
let userLoading = false;

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: currentUser, loading: userLoading }),
}));

vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack: vi.fn() }),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ push, back: vi.fn(), asPath: "/me/following" }),
}));

/* The real one needs a blurDataURL for the statically imported PNG, which the
   test runner does not produce. */
vi.mock("next/legacy/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("../components/LoadingWheel", () => ({
  default: () => <div data-testid="loading-wheel" />,
}));

function arrangerFollower(): ArrangerFollower {
  return {
    arrangerId: "a1",
    createdAt: new Date().toISOString(),
    arranger: { organization: { id: "o1", name: "MAPS" } },
  } as unknown as ArrangerFollower;
}

/* Renders the page against a fetcher the test controls, with a cache of its
   own so one test's answer never leaks into the next. */
function renderPage(fetcher: () => Promise<unknown>) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <SWRConfig
      value={{
        fetcher,
        provider: () => new Map(),
        dedupingInterval: 0,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );

  return render(<Following baseUrl="" />, { wrapper });
}

describe("/me/following", () => {
  beforeEach(() => {
    currentUser = USER;
    userLoading = false;
    push.mockClear();
  });

  it("waits for the answer instead of claiming you follow nobody", async () => {
    /* A request still in flight is not an empty list. */
    renderPage(
      () =>
        new Promise(() => {
          /* Never settles - the request stays in flight for the whole test. */
        }),
    );

    expect(await screen.findByTestId("loading-wheel")).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
  });

  it("says the request failed rather than that you follow nobody", async () => {
    /* SwrProvider swallows 401/403/404, so the page is the only place this
       failure can become visible. */
    renderPage(() => Promise.reject(new Response(null, { status: 401 })));

    expect(await screen.findByText(/fikk ikke hentet/)).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
  });

  it("lists the arrangers the API returns", async () => {
    renderPage(() => Promise.resolve([arrangerFollower()]));

    expect(await screen.findByText("MAPS")).toBeInTheDocument();
    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
  });

  it("shows the empty state when the list really is empty", async () => {
    renderPage(() => Promise.resolve([]));

    expect(await screen.findByText(EMPTY_STATE)).toBeInTheDocument();
  });

  it("sends an anonymous visitor to login", async () => {
    currentUser = undefined;
    renderPage(() => Promise.resolve([]));

    expect(push).toHaveBeenCalledWith("/login?redirect=/me/following");
    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
  });

  it("renders nothing while the auth state is still unknown", () => {
    userLoading = true;
    currentUser = undefined;
    renderPage(() => Promise.resolve([]));

    expect(screen.queryByText(EMPTY_STATE)).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
