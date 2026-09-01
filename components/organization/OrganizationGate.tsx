import { useRouter } from "next/router";
import type { ReactElement } from "react";

import useOrganization, {
  type useOrganizationUsersType,
} from "../../hooks/useOrganization";
import useSnack from "../../hooks/useSnack";
import { type Organization, SnackTypes } from "../../types/types";
import { resolveOrganizationPage } from "../../utils/organization";
import Custom404 from "../../pages/404";

export interface OrganizationGateProps {
  /** What the server prerendered, or null if it was not allowed to see it. */
  prerendered: Organization | null;
  fetchMembers?: boolean;
  children: (
    organization: Organization,
    membership: useOrganizationUsersType,
  ) => ReactElement | null;
}

/**
 * Resolves the organization an `/orgs/[oid]` page is about before that page
 * mounts, so everything below can treat it as a value that is simply there.
 *
 * The prerender carries no cookie, so for an organization only its members may
 * see the page arrives with nothing and has to ask again from the browser.
 * Both pages needed the same four answers to that - still asking, resolved,
 * confirmed absent, could not ask - and had started to differ on which of them
 * showed the not-found page. One gate, so a third page cannot get a fourth
 * opinion.
 */
export default function OrganizationGate({
  prerendered,
  fetchMembers = true,
  children,
}: OrganizationGateProps) {
  const router = useRouter();
  const { oid } = router.query;
  const { addSnack } = useSnack();
  const membership = useOrganization(oid as string, { fetchMembers });

  const page = resolveOrganizationPage({
    fetched: membership.organization,
    prerendered,
    loading: membership.loading,
    notFound: membership.organizationMissing,
  });

  /* Nothing while the browser is asking, which is what the profile page did
     before this gate existed. A spinner here would be a change to what every
     visitor sees, and this change is about which organization resolves, not
     about how waiting looks. */
  if (page.status === "loading") {
    return null;
  }

  if (page.status === "missing") {
    return <Custom404 />;
  }

  if (page.status === "unavailable" || membership.error) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return null;
  }

  return children(page.organization, membership);
}
