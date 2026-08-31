import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ArrangerListItem from "../components/ArrangerListItem";
import type { ArrangerFollower, User } from "../types/types";

const API_URL = "https://api.example.test";
const USER = { id: "u1", firstName: "Kari" } as User;
const ARRANGER_ID = "a1";

const addSnack = vi.fn();
const push = vi.fn();
let currentUser: User | undefined = USER;

vi.mock("../hooks/useUser", () => ({
  default: () => ({ user: currentUser }),
}));

vi.mock("../hooks/useSnack", () => ({
  default: () => ({ addSnack }),
}));

vi.mock("next/router", () => ({
  useRouter: () => ({ push, asPath: "/me/following" }),
}));

function arrangerFollower(): ArrangerFollower {
  return {
    arrangerId: ARRANGER_ID,
    createdAt: new Date().toISOString(),
    arranger: { organization: { id: "o1", name: "MAPS" } },
  } as unknown as ArrangerFollower;
}

/* Records every request the component makes, answering each with `status`. */
function mockApi(status: number) {
  const requests: { url: string; method?: string }[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      requests.push({ url, method: init?.method });
      return { ok: status < 400, status, json: async () => ({}) };
    }),
  );

  return requests;
}

describe("ArrangerListItem", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
    currentUser = USER;
    addSnack.mockClear();
    push.mockClear();
  });

  it("unfollows on click, and flips the label only once the API agrees", async () => {
    const clicker = userEvent.setup();
    const requests = mockApi(200);

    render(<ArrangerListItem arrangerFollower={arrangerFollower()} />);
    await clicker.click(screen.getByRole("button", { name: "Avfølg" }));

    expect(requests).toEqual([
      { url: `${API_URL}/users/u1/following/${ARRANGER_ID}`, method: "DELETE" },
    ]);
    expect(screen.getByRole("button", { name: "Følg" })).toBeInTheDocument();
  });

  it("follows again after unfollowing", async () => {
    const clicker = userEvent.setup();
    const requests = mockApi(200);

    render(<ArrangerListItem arrangerFollower={arrangerFollower()} />);
    await clicker.click(screen.getByRole("button", { name: "Avfølg" }));
    await clicker.click(screen.getByRole("button", { name: "Følg" }));

    expect(requests.map((request) => request.method)).toEqual([
      "DELETE",
      "POST",
    ]);
    expect(screen.getByRole("button", { name: "Avfølg" })).toBeInTheDocument();
  });

  it("keeps the old label when the request fails", async () => {
    /* The label is local state, so flipping it before the API confirms would
       tell the user they had unfollowed something they still follow. */
    const clicker = userEvent.setup();
    mockApi(500);

    render(<ArrangerListItem arrangerFollower={arrangerFollower()} />);
    await clicker.click(screen.getByRole("button", { name: "Avfølg" }));

    expect(screen.getByRole("button", { name: "Avfølg" })).toBeInTheDocument();
    expect(addSnack).toHaveBeenCalled();
  });

  it("sends an anonymous visitor to login instead of calling the API", async () => {
    const clicker = userEvent.setup();
    currentUser = undefined;
    const requests = mockApi(200);

    render(<ArrangerListItem arrangerFollower={arrangerFollower()} />);
    await clicker.click(screen.getByRole("button", { name: "Avfølg" }));

    expect(requests).toEqual([]);
    expect(push).toHaveBeenCalledWith("/login?redirect=%2Fme%2Ffollowing");
  });
});
