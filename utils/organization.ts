import type { GetStaticProps } from "next";
import type { ParsedUrlQuery } from "node:querystring";

import { getOrganization } from "../services/organizations";
import type { Organization } from "../types/types";

interface OrganizationParams extends ParsedUrlQuery {
  oid: string;
}

/**
 * The organization behind an `/orgs/[oid]` page, as static props.
 *
 * Both the profile and its event list needed the same fetch, the same
 * half-hour revalidate and the same "there is no such organization" answer.
 * The two copies had already drifted: one answered a missing organization with
 * `notFound`, the other with a redirect to /404 alongside props and a
 * revalidate that Next never reads on a redirect. `notFound` for both, which
 * renders the same page without rewriting the URL.
 */
export const getOrganizationStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as OrganizationParams;

  try {
    const organization = await getOrganization(oid);

    if (!organization) {
      return { notFound: true };
    }

    return {
      props: { organization },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch (error) {
    /* The slug comes straight off the URL, so it is passed as its own
       argument rather than interpolated: console treats the first argument as
       a format string, and %s/%d in a slug would rewrite the log line. */
    console.error("Failed to fetch organization", oid, error);
    return { notFound: true };
  }
};

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
