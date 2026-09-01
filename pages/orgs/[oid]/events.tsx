// Next.js.
import useSWRInfinite from "swr/infinite";

// React.
import { useState } from "react";

// Components.
import EventList from "../../../components/EventList";
import HeadComponent from "../../../components/HeadComponent";

// Services.
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Types.
import {
  type Event,
  type Organization,
  SnackTypes,
} from "../../../types/types";

// Assets.
import OrganizationGate from "../../../components/organization/OrganizationGate";
import TabSelection from "../../../components/TabSelection";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import styles from "../../../styles/OrgEvents.module.scss";
import { eventWindowBoundary } from "../../../utils/eventWindow";
import { getOrganizationStaticProps } from "../../../utils/organization";

enum TabOption {
  FUTURE_EVENTS = "FUTURE_EVENTS",
  PAST_EVENTS = "PAST_EVENTS",
}

function getGetKey(queryUrl: string, pageSize: number) {
  return (pageIndex: number, previousPageData: Event[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `${queryUrl}&take=${pageSize}&skip=${pageIndex * pageSize}`;
  };
}

interface EventsProps {
  /* Null when the prerender ran for an organization the server may not see.
     See `getOrganizationStaticProps`. */
  organization: Organization | null;
}

const EventsPage = ({ organization }: EventsProps) => (
  <OrganizationGate prerendered={organization} fetchMembers={false}>
    {(org) => <Events organization={org} />}
  </OrganizationGate>
);

interface OrganizationEventsProps {
  organization: Organization;
}

const PAGE_SIZE = 10;

/**
 * One tab's worth of events, page by page.
 *
 * The two tabs asked the same question of two different windows and each kept
 * its own copy of the answer: two `useSWRInfinite` calls, two "is there more"
 * flags and two next-page closures, differing only in the query string.
 */
function usePaginatedEvents(queryUrl: string) {
  const [hasMore, setHasMore] = useState(true);

  const { data, size, setSize } = useSWRInfinite<Event[]>(
    getGetKey(queryUrl, PAGE_SIZE),
    fetchFromPeoplyApiJson,
    {
      onSuccess: (pages) => {
        if (pages[pages.length - 1].length < PAGE_SIZE) setHasMore(false);
      },
    },
  );

  return {
    events: data,
    nextPage: hasMore ? () => setSize(size + 1) : undefined,
  };
}

const Events = ({ organization }: OrganizationEventsProps) => {
  const boundary = eventWindowBoundary();
  const [selectedTab, setSelectedTab] = useState<TabOption>(
    TabOption.FUTURE_EVENTS,
  );
  const goBack = useBack();

  const { events: futureEvents, nextPage: futureNextPage } = usePaginatedEvents(
    `/events?afterDate=${boundary}&organizationId=${organization.id}`,
  );
  const { events: pastEvents, nextPage: pastNextPage } = usePaginatedEvents(
    `/events?beforeDate=${boundary}&organizationId=${organization.id}&orderDirection=desc`,
  );

  return (
    <>
      <HeadComponent
        title={`Arrangementer for ${organization.name}`}
        description={`Sjekk ut alle arrangementene til ${organization.name}`}
        path={`/orgs/${organization.urlId ?? organization.id}/events`}
      />
      <BackButton onClick={goBack} className={styles.backButton} />
      <TabSelection
        options={[
          {
            label: "Kommende arrangementer",
            value: TabOption.FUTURE_EVENTS,
          },
          {
            label: "Tidligere arrangementer",
            value: TabOption.PAST_EVENTS,
          },
        ]}
        selected={selectedTab}
        setSelected={setSelectedTab}
      />
      <div className={styles.content}>
        {selectedTab === TabOption.FUTURE_EVENTS && (
          <EventList
            events={
              futureEvents && futureEvents?.length > 0
                ? futureEvents.flat()
                : []
            }
            nextPage={futureNextPage}
          />
        )}
        {selectedTab === TabOption.PAST_EVENTS && (
          <EventList
            events={
              pastEvents && pastEvents?.length > 0 ? pastEvents.flat() : []
            }
            nextPage={pastNextPage}
          />
        )}
      </div>
    </>
  );
};

export const getStaticProps = getOrganizationStaticProps;

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default EventsPage;
