import type { NextApiRequest, NextApiResponse } from "next";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import handler from "../pages/api/calendar/[eid]";

function createResponse() {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    status(code: number) {
      res.statusCode = code;
      return res;
    },
    json(payload: unknown) {
      res.body = payload;
      return res;
    },
    send(payload: unknown) {
      res.body = payload;
      return res;
    },
    setHeader(name: string, value: string) {
      res.headers[name] = value;
      return res;
    },
  };

  return res;
}

function answerOnlyFor(expectedUrl: string) {
  vi.mocked(fetch).mockImplementation(async (url) => {
    if (url !== expectedUrl) {
      return { ok: false, status: 404 } as Response;
    }

    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: "3f2b8c1a-4d5e-4f6a-8b9c-0d1e2f3a4b5c",
        urlId: "ABCDEFGH",
        title: "Test",
        startDate: "2026-08-15T10:00:00.000Z",
        endDate: "2026-08-15T12:00:00.000Z",
      }),
    } as Response;
  });
}

async function callHandler(eid: string | string[]) {
  const res = createResponse();

  await handler(
    { query: { eid } } as unknown as NextApiRequest,
    res as unknown as NextApiResponse,
  );

  return res;
}

describe("GET /api/calendar/[eid]", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://api.internal";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    vi.unstubAllGlobals();
  });

  it("never calls the API for an event id that could steer the request", async () => {
    const res = await callHandler("../../auth/refresh");

    expect(fetch).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(400);
  });

  it("requests the event for a valid urlId", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "3f2b8c1a-4d5e-4f6a-8b9c-0d1e2f3a4b5c",
        urlId: "ABCDEFGH",
        title: "Test",
        startDate: "2026-08-15T10:00:00.000Z",
        endDate: "2026-08-15T12:00:00.000Z",
      }),
    } as Response);

    const res = await callHandler("ABCDEFGH");

    expect(fetch).toHaveBeenCalledWith(
      "http://api.internal/events/ABCDEFGH",
      expect.anything(),
    );
    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/calendar; charset=utf-8");
  });

  it("uppercases a lowercase urlId and serves the calendar", async () => {
    answerOnlyFor("http://api.internal/events/ABCDEFGH");

    const res = await callHandler("abcdefgh");

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/calendar; charset=utf-8");
  });

  it("lowercases an uppercase UUID and serves the calendar", async () => {
    answerOnlyFor(
      "http://api.internal/events/3f2b8c1a-4d5e-4f6a-8b9c-0d1e2f3a4b5c",
    );

    const res = await callHandler("3F2B8C1A-4D5E-4F6A-8B9C-0D1E2F3A4B5C");

    expect(res.statusCode).toBe(200);
    expect(res.headers["Content-Type"]).toBe("text/calendar; charset=utf-8");
  });
});
