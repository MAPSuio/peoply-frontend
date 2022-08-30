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
import {
  getOrganization,
  getXOrganizations,
} from "../../../services/organizations";

// Types.
import { Event, Organization } from "../../../types/types";

// Assets.
import { ParsedUrlQuery } from "querystring";

function getGetKey(queryUrl: string, pageSize: number) {
  return (pageIndex: number, previousPageData: Event[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `${queryUrl}&take=${pageSize}&skip=${pageIndex * pageSize}`;
  };
}

interface EventsProps {
  organization: Organization;
  baseUrl: string;
}

const Events = ({ organization, baseUrl }: EventsProps) => {
  const today = useRef(new Date().toISOString());
  const [isMoreEvents, setMoreEvents] = useState(true);

  const queryUrl = `/events?afterDate=${today.current}&organizationId=${organization.id}`;

  const pageSize = 10;
  const getKey = getGetKey(queryUrl, pageSize);

  const {
    data: events,
    size,
    setSize,
  } = useSWRInfinite<Event[]>(getKey, fetchFromPeoplyApiJson, {
    onSuccess: (data) => {
      if (data[data.length - 1].length < pageSize) setMoreEvents(false);
    },
  });

  const nextPage = isMoreEvents
    ? () => {
        setSize(size + 1);
      }
    : undefined;

  return (
    <>
      <HeadComponent
        title={`Arrangementer for ${organization.name}`}
        description={`Sjekk ut alle arrangementene til ${organization.name}`}
        url={`${baseUrl}/orgs/${organization.id}/events`}
      />
      <EventList
        events={events && events?.length > 0 ? events.flatMap((ev) => ev) : []}
        title={`${organization.name} sine arrangementer`}
        description={`Alle kommende arrangementer for ${organization.name}`}
        nextPage={nextPage}
      />
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  oid: string;
}

// Get the data for the organization in question.
export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;
  const organization = await getOrganization(oid);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!organization) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      baseUrl,
      organization,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export async function getStaticPaths() {
  const organizations = await getXOrganizations(10000);
  const paths = organizations.map((o: Organization) => ({
    params: {
      oid: o.id,
    },
  }));

  return { paths, fallback: "blocking" };
}

export default Events;
