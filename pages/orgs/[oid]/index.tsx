// Next.js.
import useSWR from "swr";
import { useRouter } from "next/router";

// React.
import { useState } from "react";

// Components.
import HeadComponent from "../../../components/HeadComponent";
import Layout from "../../../components/Layout";
import OrganizationGate from "../../../components/organization/OrganizationGate";
import TabSelection from "../../../components/TabSelection";
import OrganizationAnalytics from "../../../components/organization/OrganizationAnalytics";
import OrganizationHeading from "../../../components/organization/OrganizationHeading";
import OrganizationProfile from "../../../components/organization/OrganizationProfile";
import OrganizationStats from "../../../components/organization/OrganizationStats";
import OrganizationUpcomingEvents from "../../../components/organization/OrganizationUpcomingEvents";
import DataIconSummary from "../../../components/svgs/DataIconSummary";
import HomeIcon from "../../../components/svgs/HomeIcon";

// Hooks.
import useSnack from "../../../hooks/useSnack";
import type { useOrganizationUsersType } from "../../../hooks/useOrganization";

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
import styles from "../../../styles/Organization.module.scss";

interface OrganizationProps {
  /* Null when the prerender ran for an organization the server may not see:
     pending moderation, or absent. The browser asks again with the cookie. */
  organization: Organization | null;
}

enum OrgTab {
  OVERVIEW = "OVERVIEW",
  STATISTICS = "STATISTICS",
}

interface OrganizationViewProps {
  org: Organization;
  isMemberOfOrg: boolean;
  isAdminOrOwner?: boolean;
  memberCount?: number;
  events?: Event[];
}

/* Any role in the org counts - `isMember` is strictly role === MEMBER, so
   the gate is the membership row itself. Outsiders get the page exactly as
   before, and the analytics component (and its members-only request) never
   mounts. */
const OrganizationView = ({
  org,
  isMemberOfOrg,
  isAdminOrOwner,
  memberCount,
  events,
}: OrganizationViewProps) => {
  const [selectedTab, setSelectedTab] = useState(OrgTab.OVERVIEW);

  return (
    <Layout>
      <OrganizationHeading organization={org} isAdminOrOwner={isAdminOrOwner} />
      {isMemberOfOrg && (
        <div className={styles.tabs}>
          <TabSelection
            options={[
              { label: "Oversikt", value: OrgTab.OVERVIEW, icon: <HomeIcon /> },
              {
                label: "Statistikk",
                value: OrgTab.STATISTICS,
                icon: <DataIconSummary />,
              },
            ]}
            selected={selectedTab}
            setSelected={setSelectedTab}
          />
        </div>
      )}
      <OrganizationProfile organization={org} />
      {isMemberOfOrg && selectedTab === OrgTab.STATISTICS ? (
        <OrganizationAnalytics organization={org} />
      ) : (
        <>
          <OrganizationStats
            organization={org}
            isMemberOfOrg={isMemberOfOrg}
            isAdminOrOwner={isAdminOrOwner}
            memberCount={memberCount}
            eventCount={events?.length}
          />
          <OrganizationUpcomingEvents organization={org} events={events} />
        </>
      )}
    </Layout>
  );
};

const Organization = ({ organization }: OrganizationProps) => (
  <OrganizationGate prerendered={organization}>
    {(org, membership) => (
      <OrganizationPage org={org} membership={membership} />
    )}
  </OrganizationGate>
);

interface OrganizationPageProps {
  org: Organization;
  membership: useOrganizationUsersType;
}

const OrganizationPage = ({ org, membership }: OrganizationPageProps) => {
  const { addSnack } = useSnack();

  const { data: orgEvents, error: orgEventsError } = useSWR<Event[]>(
    `/events?afterDate=${eventWindowBoundary()}&organizationId=${org.id}`,
    fetchFromPeoplyApiJson,
    { fallbackData: [] },
  );

  if (orgEventsError) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return null;
  }

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
      <OrganizationView
        org={org}
        isMemberOfOrg={Boolean(membership.organizationUser)}
        isAdminOrOwner={membership.isAdminOrOwner}
        memberCount={membership.organizationUsers?.length ?? org.memberCount}
        events={orgEvents}
      />
    </>
  );
};

export const getStaticProps = getOrganizationStaticProps;

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default Organization;
