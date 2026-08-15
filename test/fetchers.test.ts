import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, ApiTimeoutError } from "../services/apiError";
import {
  MAX_PAGE_SIZE,
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";

const API_URL = "https://api.example.test";

/* Records every URL fetchAllFromPeoplyApiJson asks for, and answers with the
   requested slice of `rows`. */
function mockApi(rows: unknown[]) {
  const requested: string[] = [];

  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      requested.push(url);

      const query = new URL(url).searchParams;
      const take = Number(query.get("take"));
      const skip = Number(query.get("skip") ?? 0);

      return new Response(JSON.stringify(rows.slice(skip, skip + take)), {
        status: 200,
      });
    }),
  );

  return requested;
}

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `id-${index}` }));
}

describe("fetchFromPeoplyApiJson", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
  });

  it("returns undefined for a 204 instead of throwing on the empty body", async () => {
    /* The prod bug this replaced: GET /users/:id/registrations/:eventId answers
       204 for every event the user has not signed up for. .json() on an empty
       body throws a SyntaxError - not a Response - so SwrProvider's onError
       could not tell it apart from a real failure and snacked "Noe gikk galt"
       on every event page. */
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 204 })),
    );

    await expect(
      fetchFromPeoplyApiJson("/users/u1/registrations/e1"),
    ).resolves.toBeUndefined();
  });

  it("returns undefined for a bodiless 200 instead of throwing", async () => {
    /* Nest's express adapter answers `response.send()` - a 200 with no body,
       not a 204 - for any handler that resolves to null. GET /popups/active
       does exactly that whenever nothing is scheduled, so the status check
       alone was not enough and .json() threw a SyntaxError on every poll. */
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 200 })),
    );

    await expect(
      fetchFromPeoplyApiJson("/popups/active"),
    ).resolves.toBeUndefined();
  });

  it("still parses the body on a 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ regStatus: "GOING" }), { status: 200 }),
      ),
    );

    await expect(
      fetchFromPeoplyApiJson("/users/u1/registrations/e1"),
    ).resolves.toEqual({ regStatus: "GOING" });
  });

  it("throws an ApiError carrying the status on a failure", async () => {
    /* onError distinguishes 401/403/404 from real errors by reading .status off
       the thrown value, so that has to survive as a typed ApiError rather
       than the raw Response. */
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}", { status: 500 })),
    );

    await expect(
      fetchFromPeoplyApiJson("/users/u1/registrations/e1"),
    ).rejects.toBeInstanceOf(ApiError);

    await expect(
      fetchFromPeoplyApiJson("/users/u1/registrations/e1"),
    ).rejects.toMatchObject({
      status: 500,
      path: "/users/u1/registrations/e1",
    });
  });

  it("carries the parsed error body on the ApiError", async () => {
    /* pages/orgs/[oid]/index.tsx reads e.body off a 429 to show a retry
       countdown - the body has to survive the throw. */
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ remainingSeconds: 42 }), {
            status: 429,
          }),
      ),
    );

    await expect(
      fetchFromPeoplyApiJson("/organizations/o1/report"),
    ).rejects.toMatchObject({ status: 429, body: { remainingSeconds: 42 } });
  });

  it("surfaces a timeout as an ApiTimeoutError instead of hanging forever", async () => {
    /* fetch never resolves on its own here - only aborting it does, exactly
       like a request stuck against a dead API. */
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => {
              reject(
                new DOMException("The operation was aborted.", "AbortError"),
              );
            });
          }),
      ),
    );

    await expect(
      fetchFromPeoplyApiJson("/users/u1/registrations/e1", undefined, {
        timeoutMs: 10,
      }),
    ).rejects.toBeInstanceOf(ApiTimeoutError);
  });
});

describe("fetchAllFromPeoplyApiJson", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", API_URL);
  });

  it("never asks for more than the API's page size", async () => {
    /* The prod bug this replaced: take=500 returned 400 "take must not be
       greater than 100". */
    const requested = mockApi(rows(250));

    await fetchAllFromPeoplyApiJson("/events");

    for (const url of requested) {
      const take = Number(new URL(url).searchParams.get("take"));
      expect(take).toBeLessThanOrEqual(MAX_PAGE_SIZE);
    }
  });

  it("returns every row across pages, in order and without duplicates", async () => {
    const all = rows(250);
    mockApi(all);

    const result = await fetchAllFromPeoplyApiJson<{ id: string }>("/events");

    expect(result).toEqual(all);
    expect(new Set(result.map((row) => row.id)).size).toBe(250);
  });

  it("omits skip on the first page", async () => {
    /* /users/:id/registrations validates skip as >= 1, so skip=0 is a 400. */
    const requested = mockApi(rows(150));

    await fetchAllFromPeoplyApiJson("/events");

    expect(new URL(requested[0]).searchParams.has("skip")).toBe(false);
    expect(new URL(requested[1]).searchParams.get("skip")).toBe("100");
  });

  it("stops once a page comes back short", async () => {
    const requested = mockApi(rows(150));

    await fetchAllFromPeoplyApiJson("/events");

    expect(requested).toHaveLength(2);
  });

  it("makes a single request when everything fits on one page", async () => {
    const requested = mockApi(rows(25));

    await fetchAllFromPeoplyApiJson("/organizations");

    expect(requested).toHaveLength(1);
  });

  it("appends to an existing query string with & instead of ?", async () => {
    const requested = mockApi(rows(3));

    await fetchAllFromPeoplyApiJson("/organizations?orderBy=name");

    expect(requested[0]).toBe(
      `${API_URL}/organizations?orderBy=name&take=${MAX_PAGE_SIZE}`,
    );
  });

  it("keeps paging when the last page is exactly full", async () => {
    /* 200 rows means page 2 is full, so the loop cannot know it is done until
       page 3 comes back empty. */
    const requested = mockApi(rows(200));

    const result = await fetchAllFromPeoplyApiJson("/events");

    expect(result).toHaveLength(200);
    expect(requested).toHaveLength(3);
  });

  it("treats an undefined first batch (204) as no pages instead of crashing", async () => {
    /* The documented 204 case: the API answers "nothing here" with an empty
       body instead of an empty array, and fetchFromPeoplyApiJson turns that
       into `undefined`. `items.push(...undefined)` used to throw. */
    const requested: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        requested.push(url);
        return new Response(null, { status: 204 });
      }),
    );

    await expect(fetchAllFromPeoplyApiJson("/events")).resolves.toEqual([]);
    expect(requested).toHaveLength(1);
  });

  it("stops cleanly when a later page comes back as an undefined batch (204)", async () => {
    const requested: string[] = [];
    const firstPage = rows(MAX_PAGE_SIZE);

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        requested.push(url);
        const skip = Number(new URL(url).searchParams.get("skip") ?? 0);

        if (skip === 0) {
          return new Response(JSON.stringify(firstPage), { status: 200 });
        }

        return new Response(null, { status: 204 });
      }),
    );

    const result = await fetchAllFromPeoplyApiJson("/events");

    expect(result).toEqual(firstPage);
    expect(requested).toHaveLength(2);
  });

  it("propagates a failed response instead of returning a partial list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ message: ["take must not be greater than 100"] }),
            { status: 400 },
          ),
      ),
    );

    await expect(fetchAllFromPeoplyApiJson("/events")).rejects.toMatchObject({
      status: 400,
    });
  });
});
