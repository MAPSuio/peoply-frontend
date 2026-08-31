import type { RouteMatchCallbackOptions, RuntimeCaching } from "serwist";
import { describe, expect, it } from "vitest";

import { restrictToSameOriginNonApiRequests } from "../service-worker/runtimeCaching";

const APPLICATION_ORIGIN = "https://peoply.app";

const requestFor = (href: string): RouteMatchCallbackOptions => {
  const url = new URL(href);

  return {
    url,
    request: {} as RouteMatchCallbackOptions["request"],
    event: {} as RouteMatchCallbackOptions["event"],
    sameOrigin: url.origin === APPLICATION_ORIGIN,
  };
};

const cachesGoogleFonts: RuntimeCaching = {
  matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
  handler: { handle: async () => new Response() },
};

const cachesImages: RuntimeCaching = {
  matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
  handler: { handle: async () => new Response() },
};

const cachesApiResponses: RuntimeCaching = {
  method: "GET",
  matcher: ({ sameOrigin, url }) =>
    sameOrigin && url.pathname.startsWith("/api/"),
  handler: { handle: async () => new Response() },
};

const cachesEverythingElse: RuntimeCaching = {
  matcher: /.*/i,
  handler: { handle: async () => new Response() },
};

const cachesOneExactUrl: RuntimeCaching = {
  matcher: "/api/calendar/event-1",
  handler: { handle: async () => new Response() },
};

const guarded = restrictToSameOriginNonApiRequests([
  cachesGoogleFonts,
  cachesImages,
  cachesApiResponses,
  cachesEverythingElse,
  cachesOneExactUrl,
]);

const matchersOf = (entries: RuntimeCaching[]) =>
  entries.map(
    (entry) => entry.matcher as (options: RouteMatchCallbackOptions) => unknown,
  );

const anyEntryMatches = (href: string) =>
  matchersOf(guarded).some((matcher) => Boolean(matcher(requestFor(href))));

describe("restrictToSameOriginNonApiRequests", () => {
  it("stops every entry from matching a cross-origin request", () => {
    expect(anyEntryMatches("https://fonts.gstatic.com/s/inter.woff2")).toBe(
      false,
    );
    expect(anyEntryMatches("https://api.peoply.app/users/me")).toBe(false);
  });

  it("stops every entry from matching a same-origin api request", () => {
    expect(anyEntryMatches(`${APPLICATION_ORIGIN}/api/calendar/event-1`)).toBe(
      false,
    );
  });

  it("keeps matching same-origin assets", () => {
    expect(anyEntryMatches(`${APPLICATION_ORIGIN}/logo.png`)).toBe(true);
  });

  it("keeps the entry order, handlers and methods untouched", () => {
    expect(guarded).toHaveLength(5);
    expect(guarded[1].handler).toBe(cachesImages.handler);
    expect(guarded[2].method).toBe("GET");
  });

  it("still delegates to the original matcher for same-origin requests", () => {
    const [matchesGoogleFonts, matchesImages] = matchersOf(guarded);

    expect(
      Boolean(matchesImages(requestFor(`${APPLICATION_ORIGIN}/logo.png`))),
    ).toBe(true);
    expect(
      Boolean(matchesImages(requestFor(`${APPLICATION_ORIGIN}/about`))),
    ).toBe(false);
    expect(
      Boolean(matchesGoogleFonts(requestFor(`${APPLICATION_ORIGIN}/logo.png`))),
    ).toBe(false);
  });
});
