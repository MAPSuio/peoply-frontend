import type { GetServerSideProps } from "next";
import { fetchAllFromPeoplyApiJson } from "../services/fetchers";
import { Event, Organization, Visibility } from "../types/types";

/**
 * Serves /sitemap.xml. The static public routes always render; event and
 * organization URLs are appended on a best-effort basis so an unreachable API
 * degrades the sitemap instead of breaking it. Auth-only routes (/me/*,
 * /stats, /feedback, create/edit pages) are deliberately absent.
 */

const STATIC_ROUTES = [
  "/",
  "/events",
  "/kalender",
  "/find",
  "/orgs",
  "/faq",
  "/integrasjoner",
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getEventPaths(): Promise<string[]> {
  // Same window as the public calendar: upcoming events for the next year.
  const rangeStart = new Date();
  rangeStart.setHours(0, 0, 0, 0);
  const rangeEnd = new Date(rangeStart);
  rangeEnd.setFullYear(rangeEnd.getFullYear() + 1);

  const query = new URLSearchParams({
    afterDate: rangeStart.toISOString(),
    beforeDate: rangeEnd.toISOString(),
    orderBy: "startDate",
    orderDirection: "asc",
  });

  const events = await fetchAllFromPeoplyApiJson<Event>(`/events?${query}`);

  return events
    .filter((event) => event.visibility === Visibility.PUBLIC && event.urlId)
    .map((event) => `/events/${event.urlId}`);
}

async function getOrganizationPaths(): Promise<string[]> {
  const orgs = await fetchAllFromPeoplyApiJson<Organization>(
    "/organizations?orderBy=name",
  );

  return orgs.map((org) => `/orgs/${org.urlId ?? org.id}`);
}

/**
 * The shared fetchers have no timeout, and a crawler hitting /sitemap.xml
 * should not hang on a stuck API - beyond this, the static routes ship alone.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms),
    ),
  ]);
}

function buildXml(baseUrl: string, paths: string[]) {
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(`${baseUrl}${path}`)}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const paths = [...STATIC_ROUTES];

  // Both lists are best-effort: if the API is down or slow to answer, the
  // sitemap still ships the static routes rather than erroring out.
  const [events, orgs] = await Promise.allSettled([
    withTimeout(getEventPaths(), 10_000),
    withTimeout(getOrganizationPaths(), 10_000),
  ]);

  if (events.status === "fulfilled") paths.push(...events.value);
  if (orgs.status === "fulfilled") paths.push(...orgs.value);

  res.setHeader("Content-Type", "application/xml");
  // Let crawlers and the CDN reuse the response for an hour.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=86400",
  );
  res.write(buildXml(baseUrl, paths));
  res.end();

  return { props: {} };
};

// Never rendered - getServerSideProps ends the response - but Next requires a
// default export for anything under pages/.
export default function Sitemap() {
  return null;
}
