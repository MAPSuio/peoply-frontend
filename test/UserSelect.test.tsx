import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserSelect from "../components/UserSelect";
import type { User } from "../types/types";

const API_URL = "https://api.example.test";

/* The component debounces by 300ms. Real timers rather than fake ones: mixing
   fake timers with userEvent's own scheduler deadlocks the typing helper. */
const PAST_DEBOUNCE = 500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function testUser(id: string, firstName: string): User {
  return { id, firstName, lastName: "Testesen" } as User;
}

/* Answers every /users search with `result`, and records the search terms. */
function mockUserSearch(result: User[] = []) {
  const searched: string[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      searched.push(new URL(url).searchParams.get("name") ?? "");
      return { ok: true, status: 200, json: async () => result };
    }),
  );

  return searched;
}

function userSelect(excludeUsers?: User[]) {
  return (
    <UserSelect
      selectedUsers={[]}
      onUserSelect={vi.fn()}
      onUserRemove={vi.fn()}
      excludeUsers={excludeUsers}
    />
  );
}

describe("UserSelect", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
  });

  it("debounces: typing a word issues one request, not one per keystroke", async () => {
    const typist = userEvent.setup();
    const searched = mockUserSearch();

    render(userSelect());
    await typist.type(screen.getByRole("searchbox"), "kari");
    await wait(PAST_DEBOUNCE);

    expect(searched).toEqual(["kari"]);
  });

  it("does not fire a stale search after unmounting mid-type", async () => {
    const typist = userEvent.setup();
    const searched = mockUserSearch();

    const { unmount } = render(userSelect());
    await typist.type(screen.getByRole("searchbox"), "kari");

    /* Leave while the debounce is still pending. Before the effect cleanup was
       added, this timer survived the unmount and searched anyway. */
    unmount();
    await wait(PAST_DEBOUNCE);

    expect(searched).toEqual([]);
  });

  it("escapes the search term", async () => {
    const typist = userEvent.setup();
    const requested: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        requested.push(url);
        return { ok: true, status: 200, json: async () => [] };
      }),
    );

    render(userSelect());
    await typist.type(screen.getByRole("searchbox"), "a&b");
    await wait(PAST_DEBOUNCE);

    expect(requested[0]).toContain("name=a%26b");
  });

  it("filters out excluded users without refetching", async () => {
    const typist = userEvent.setup();
    const searched = mockUserSearch([
      testUser("1", "Kari"),
      testUser("2", "Ola"),
    ]);

    render(userSelect([testUser("2", "Ola")]));
    await typist.type(screen.getByRole("searchbox"), "a");

    await waitFor(() => expect(screen.getByText(/Kari/)).toBeInTheDocument());

    expect(screen.queryByText(/Ola/)).not.toBeInTheDocument();
    expect(searched).toHaveLength(1);
  });

  it("does not restart the debounce when the parent re-renders excludeUsers", async () => {
    const typist = userEvent.setup();
    const searched = mockUserSearch();

    /* Callers build this list inline, so it is a new array on every render. If
       it were still an effect dependency, each re-render would reset the timer
       and the search below would never fire at all. */
    const { rerender } = render(userSelect([]));
    await typist.type(screen.getByRole("searchbox"), "kari");

    for (let i = 0; i < 5; i++) {
      rerender(userSelect([]));
      await wait(50);
    }

    await wait(PAST_DEBOUNCE);

    expect(searched).toEqual(["kari"]);
  });

  it("has an accessible name", () => {
    mockUserSearch();
    render(userSelect());

    expect(screen.getByRole("searchbox")).toHaveAccessibleName(
      "Søk etter personer",
    );
  });
});
