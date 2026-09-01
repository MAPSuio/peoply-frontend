// Next.js.
import { useRouter } from "next/router";
import useSWRInfinite from "swr/infinite";

// React.
import { useState } from "react";

// Components.
import Custom404 from "../../404";
import EventList from "../../../components/EventList";
import HeadComponent from "../../../components/HeadComponent";

// Services.
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Types.
import type { Event, Organization } from "../../../types/types";

// Assets.
import TabSelection from "../../../components/TabSelection";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import useOrganization from "../../../hooks/useOrganization";
import styles from "../../../styles/OrgEvents.module.scss";
import { eventWindowBoundary } from "../../../utils/eventWindow";
import {
  getOrganizationStaticProps,
  resolveOrganizationPage,
} from "../../../utils/organization";

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

/**
 * Resolves the organization before the list mounts, so everything below can
 * keep treating it as a value that is simply there.
 */
const Events = ({ organization }: EventsProps) => {
  const router = useRouter();
  const { oid } = router.query;
  const { organization: fetched, loading } = useOrganization(oid as string, {
    fetchMembers: false,
  });

  const { organization: org, missing } = resolveOrganizationPage({
    fetched,
    prerendered: organization,
    loading,
  });

  if (loading) {
    return null;
  }

  if (!org || missing) {
    return <Custom404 />;
  }

  return <OrganizationEvents organization={org} />;
};

interface OrganizationEventsProps {
  organization: Organization;
}

const OrganizationEvents = ({ organization }: OrganizationEventsProps) => {
  const boundary = eventWindowBoundary();
  const [isMoreFutureEvents, setIsMoreFutureEvents] = useState(true);
  const [isMorePastEvents, setIsMorePastEvents] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabOption>(
    TabOption.FUTURE_EVENTS,
  );
  const goBack = useBack();

  const futureQueryUrl = `/events?afterDate=${boundary}&organizationId=${organization.id}`;
  const pastQueryUrl = `/events?beforeDate=${boundary}&organizationId=${organization.id}&orderDirection=desc`;

  const pageSize = 10;
  const getKeyFuture = getGetKey(futureQueryUrl, pageSize);
  const getKeyPast = getGetKey(pastQueryUrl, pageSize);

  const {
    data: futureEvents,
    size: futureEventsSize,
    setSize: setFutureEventsSize,
  } = useSWRInfinite<Event[]>(getKeyFuture, fetchFromPeoplyApiJson, {
    onSuccess: (data) => {
      if (data[data.length - 1].length < pageSize) setIsMoreFutureEvents(false);
    },
  });
  const {
    data: pastEvents,
    size: pastEventsSize,
    setSize: setPastEventsSize,
  } = useSWRInfinite<Event[]>(getKeyPast, fetchFromPeoplyApiJson, {
    onSuccess: (data) => {
      if (data[data.length - 1].length < pageSize) setIsMorePastEvents(false);
    },
  });

  const futureNextPage = isMoreFutureEvents
    ? () => {
        setFutureEventsSize(futureEventsSize + 1);
      }
    : undefined;

  const pastNextPage = isMorePastEvents
    ? () => {
        setPastEventsSize(pastEventsSize + 1);
      }
    : undefined;

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

export default Events;
