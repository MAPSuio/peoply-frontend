import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import EventList from "../../components/EventList";
import HeadComponent from "../../components/HeadComponent";
import Header from "../../components/Header";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { Event } from "../../types/types";
import { queryToString } from "../../utils/functions";

function getGetKey(queryUrl: string, pageSize: number) {
  return (pageIndex: number, previousPageData: Event[]) => {
    if (previousPageData && !previousPageData.length) return null;
    return `${queryUrl}take=${pageSize}&skip=${pageIndex * pageSize}`;
  };
}

const Events: NextPage = () => {
  const router = useRouter();
  const [isMoreEvents, setMoreEvents] = useState(true);
  const queryUrl = useMemo(
    () =>
      router.query ? `/events?${queryToString(router.query)}&` : `/events?`,
    [router.query],
  );

  const pageSize = 10;
  const getKey = getGetKey(queryUrl, pageSize);

  const {
    data: events,
    size,
    setSize,
  } = useSWRInfinite<Event[]>(getKey, fetchFromPeoplyApiJson, {
    onSuccess: (data, key, config) => {
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
        title="Arrangementer"
        description="Home page of Peoply"
        url={`${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`}
      />
      <Header />
      <EventList
        events={events && events?.length > 0 ? events.flatMap((ev) => ev) : []}
        title={"Arrangementer"}
        description={"Alle arrangementer etter søk"}
        nextPage={nextPage}
      />
    </>
  );
};

export default Events;
