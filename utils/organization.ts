import type { GetStaticProps } from "next";
import type { ParsedUrlQuery } from "node:querystring";

import { getOrganization } from "../services/organizations";
import type { Organization } from "../types/types";
import { isValidApiRef } from "./apiPathParams";

interface OrganizationParams extends ParsedUrlQuery {
  oid: string;
}

/** How long a prerendered organization is served before it is fetched again. */
const ORGANIZATION_MAX_AGE_SECONDS = 60 * 30;

/**
 * How long the page waits before asking again about an organization the server
 * could not see.
 *
 * Short, because the usual reason is that moderation has not approved it yet,
 * and the moment it does the answer changes. `fallback: "blocking"` caches
 * whatever this function returns, so an answer without a revalidate outlives
 * the decision it was based on.
 */
const UNRESOLVED_MAX_AGE_SECONDS = 60;

/**
 * The organization behind an `/orgs/[oid]` page, as static props.
 *
 * Both the profile and its event list needed the same fetch, the same
 * half-hour revalidate and the same "there is no such organization" answer.
 * The two copies had already drifted: one answered a missing organization with
 * `notFound`, the other with a redirect to /404 alongside props and a
 * revalidate that Next never reads on a redirect.
 *
 * The prerender runs on the server with no visitor attached: it calls the API
 * over the internal URL and carries no cookie, so it sees exactly what an
 * anonymous stranger sees. That makes "the server got a 404" mean two
 * different things - the organization does not exist, or it does and this
 * caller may not see it - and the API deliberately cannot tell them apart,
 * because saying "exists, but not for you" is how you enumerate a moderation
 * queue.
 *
 * So the page is handed nothing rather than a 404, and asks again from the
 * browser where the cookie exists. A founder whose organization is still
 * pending reaches their own page, and every members-only view that hangs off
 * it, while a stranger gets the same answer as before. The cost is that a
 * genuinely missing organization is answered by the page rather than by Next,
 * which is a soft 404 for a URL nothing links to.
 */
export const getOrganizationStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as OrganizationParams;

  /* No revalidate: a ref that cannot name an organization will never start
     naming one. */
  if (!isValidApiRef(oid)) {
    return { notFound: true };
  }

  try {
    const organization = await getOrganization(oid);

    return organization
      ? {
          props: { organization },
          revalidate: ORGANIZATION_MAX_AGE_SECONDS,
        }
      : unresolvedOrganization();
  } catch (error) {
    /* The slug comes straight off the URL, so it is passed as its own
       argument rather than interpolated: console treats the first argument as
       a format string, and %s/%d in a slug would rewrite the log line. */
    console.error("Failed to fetch organization", oid, error);
    return unresolvedOrganization();
  }
};

function unresolvedOrganization() {
  return {
    props: { organization: null },
    revalidate: UNRESOLVED_MAX_AGE_SECONDS,
  };
}

/**
 * An organization's own URL, by slug when it has one and by id otherwise.
 * The org page spelled out `org.urlId ?? org.id` at six call sites.
 */
export function organizationPath(
  organization: Pick<Organization, "id" | "urlId">,
  subPath = "",
) {
  return `/orgs/${organization.urlId ?? organization.id}${subPath}`;
}

export interface OrganizationPageReads {
  /** What the browser fetched, with the visitor's cookies attached. */
  fetched: Organization | undefined;
  /** What the server prerendered, anonymously, or null if it saw nothing. */
  prerendered: Organization | null;
  /* Undefined where the hook has nothing outstanding to report. */
  loading: boolean | undefined;
}

/**
 * Which organization an `/orgs/[oid]` page should render, and whether to give
 * up and say it does not exist.
 *
 * Missing means both reads came back empty. Saying it while the browser is
 * still asking would flash the not-found page on the first paint of every
 * page the server was not allowed to prerender, which is every pending
 * organization seen by its own founder.
 */
export function resolveOrganizationPage({
  fetched,
  prerendered,
  loading,
}: OrganizationPageReads) {
  const organization = fetched ?? prerendered ?? undefined;

  return { organization, missing: !organization && !loading };
}
