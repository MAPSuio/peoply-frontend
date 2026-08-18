// Next.js.
import useSWR from "swr";
import { useRouter } from "next/router";

// React.

// Components.
import HeadComponent from "../../../components/HeadComponent";
import Layout from "../../../components/Layout";
import OrganizationHeading from "../../../components/organization/OrganizationHeading";
import OrganizationProfile from "../../../components/organization/OrganizationProfile";
import OrganizationStats from "../../../components/organization/OrganizationStats";
import OrganizationUpcomingEvents from "../../../components/organization/OrganizationUpcomingEvents";

// Hooks.
import useSnack from "../../../hooks/useSnack";
import useOrganization from "../../../hooks/useOrganization";

// Services.
import {
  type Event,
  /* Type-only: shadowed by the `Organization` component below - see the same
     note in pages/events/[eid]/index.tsx. */
  type Organization,
  SnackTypes,
} from "../../../types/types";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

import { eventWindowBoundary } from "../../../utils/eventWindow";
import {
  getOrganizationStaticProps,
  organizationPath,
} from "../../../utils/organization";

interface OrganizationProps {
  organization: Organization;
}

const Organization = ({ organization }: OrganizationProps) => {
  const { addSnack } = useSnack();
  const router = useRouter();
  const { oid } = router.query;

  const {
    organization: orgData,
    organizationUsers: orgMembers,
    isAdminOrOwner,
    loading: orgLoading,
    error: orgError,
  } = useOrganization(oid as string);

  const { data: orgEvents, error: orgEventsError } = useSWR<Event[]>(
    () =>
      orgData?.id
        ? `/events?afterDate=${eventWindowBoundary()}&organizationId=${orgData?.id}`
        : false,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  if (orgLoading) {
    return null;
  }

  if (!organization && (!orgData || orgError || orgEventsError)) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return null;
  }

  /* use either fresh or fallback data */
  const org = orgData ?? organization;

  return (
    <>
      <HeadComponent
        title={org.name}
        description={
          org.description
            ? org.description
            : `Organisasjonssiden til ${org.name}`
        }
        path={organizationPath(org)}
        imageUrl={org.image}
      />
      <Layout>
        <OrganizationHeading
          organization={org}
          isAdminOrOwner={isAdminOrOwner}
        />
        <OrganizationProfile organization={org} />
        <OrganizationStats
          organization={org}
          isAdminOrOwner={isAdminOrOwner}
          memberCount={orgMembers?.length}
          eventCount={orgEvents?.length}
        />
        <OrganizationUpcomingEvents organization={org} events={orgEvents} />
      </Layout>
    </>
  );
};

export const getStaticProps = getOrganizationStaticProps;

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default Organization;
