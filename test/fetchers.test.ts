import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_PAGE_SIZE, fetchAllFromPeoplyApiJson } from "../services/fetchers";

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

      return {
        ok: true,
        status: 200,
        json: async () => rows.slice(skip, skip + take),
      };
    }),
  );

  return requested;
}

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({ id: `id-${index}` }));
}

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

  it("propagates a failed response instead of returning a partial list", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 400,
        json: async () => ({ message: ["take must not be greater than 100"] }),
      })),
    );

    await expect(fetchAllFromPeoplyApiJson("/events")).rejects.toMatchObject({
      status: 400,
    });
  });
});
