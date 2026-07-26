// Next.js.
import { GetStaticProps } from "next";
import useSWRInfinite from "swr/infinite";

// React.
import { useRef, useState } from "react";

// Components.
import EventList from "../../../components/EventList";
import HeadComponent from "../../../components/HeadComponent";

// Services.
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";
import { getOrganization } from "../../../services/organizations";

// Types.
import { Event, Organization } from "../../../types/types";

// Assets.
import { ParsedUrlQuery } from "querystring";
import TabSelection from "../../../components/TabSelection";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import styles from "../../../styles/OrgEvents.module.scss";

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
  organization: Organization;
}

const Events = ({ organization }: EventsProps) => {
  const today = useRef(new Date().toISOString());
  const [isMoreFutureEvents, setIsMoreFutureEvents] = useState(true);
  const [isMorePastEvents, setIsMorePastEvents] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabOption>(
    TabOption.FUTURE_EVENTS,
  );
  const goBack = useBack();

  const futureQueryUrl = `/events?afterDate=${today.current}&organizationId=${organization.id}`;
  const pastQueryUrl = `/events?beforeDate=${today.current}&organizationId=${organization.id}&orderDirection=desc`;

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
                ? futureEvents.flatMap((ev) => ev)
                : []
            }
            nextPage={futureNextPage}
          />
        )}
        {selectedTab === TabOption.PAST_EVENTS && (
          <EventList
            events={
              pastEvents && pastEvents?.length > 0
                ? pastEvents.flatMap((ev) => ev)
                : []
            }
            nextPage={pastNextPage}
          />
        )}
      </div>
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  oid: string;
}

// Get the data for the organization in question.
export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;

  try {
    const organization = await getOrganization(oid);

    if (!organization) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        organization,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch (error) {
    console.error(`Failed to fetch organization ${oid}:`, error);
    return {
      notFound: true,
    };
  }
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default Events;
