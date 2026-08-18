// Next.js.
import type { NextPage } from "next";
import dynamic from "next/dynamic";
import useSWR from "swr";

// React.
import { useEffect, useState } from "react";

// Components.
import Navbar from "../components/Navbar";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Services.

// Types.
import type { Event, Organization } from "../types/types";
import type { ArrangerFollower } from "../types/types";

// Styles.
import styles from "../styles/Home.module.scss";
import useUser from "../hooks/useUser";

/* Lazy loaded. Every carousel below is gated on SWR data, so none of them can
   render until a fetch resolves. Both point at the same module specifier, so
   they share one chunk.

   `ssr: false` states what was already true: these never rendered on the server,
   because the data they need is fetched from the client. */
const EventCarousel = dynamic(
  () => import("../components/HomeCarousels").then((m) => m.EventCarousel),
  { ssr: false },
);
const OrganizationCarousel = dynamic(
  () =>
    import("../components/HomeCarousels").then((m) => m.OrganizationCarousel),
  { ssr: false },
);

/* Midlertidig fadderuke-overskrift. Etter 14.08.2026 faller frontsiden
   automatisk tilbake til standardteksten - ingen deploy trengs for å rulle den
   tilbake. Kutt konstantene og bruk DEFAULT_UPCOMING_HEADER direkte når
   fadderuken er ferdig.

   Grensen settes lokalt (00:00 den 15.08), ikke i UTC, slik at teksten står ut
   hele 14.08 for brukere i norsk tid. Verdien leses først i useEffect fordi
   serveren og klienten kan stå på hver sin side av grensen. */
const FADDERUKE_HEADER_UNTIL = new Date(2026, 7, 15);
const DEFAULT_UPCOMING_HEADER = "Hva skjer fremover?";
const FADDERUKE_HEADER = "Velkommen til fadderuken!";

const Home: NextPage = () => {
  const { user } = useUser();
  /* Computed once on mount rather than in an effect. The effect version set
     this twice - `new Date()` on the first render, then two hours earlier once
     the effect ran - and SWR keys off the value, so every load of the front
     page fired two `/events` requests and threw the first answer away:

       GET /events?afterDate=2026-08-16T09:40:33.701Z&orderBy=startDate
       GET /events?afterDate=2026-08-16T07:40:33.714Z&orderBy=startDate

     Nothing renders the value, so unlike `upcomingHeader` below it cannot
     produce a hydration mismatch by being decided during render. */
  const [todayString] = useState<string>(() => {
    const today = new Date();
    today.setHours(today.getHours() - 2);
    return today.toISOString();
  });
  const [upcomingHeader, setUpcomingHeader] = useState<string>(
    DEFAULT_UPCOMING_HEADER,
  );

  useEffect(() => {
    if (new Date() < FADDERUKE_HEADER_UNTIL) {
      setUpcomingHeader(FADDERUKE_HEADER);
    }
  }, []);

  const eventsQuery = {
    afterDate: todayString,
    orderBy: "startDate",
  };

  const { data: followedArrangers, error: followedArrangersError } = useSWR<
    ArrangerFollower[]
  >(user ? `/users/${user.id}/following` : null);

  const followedEventsQuery = {
    afterDate: todayString,
    orderBy: "startDate",
    arrangerIds: followedArrangers
      ?.map((arranger) => arranger.arrangerId)
      .join(","),
  };

  const { data: futureEvents, error: futureEventsError } = useSWR<Event[]>(
    `/events?afterDate=${todayString}&orderBy=startDate`,
  );

  const {
    data: eventsFromFollowedOrganizations,
    error: eventsFromFollowedOrganizationsError,
  } = useSWR<Event[]>(
    followedArrangers && followedArrangers.length > 0
      ? `/events?afterDate=${todayString}&orderBy=startDate&arrangerIds=${followedEventsQuery.arrangerIds}`
      : null,
  );

  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(`/organizations?take=20`);

  return (
    <>
      <HeadComponent title="Peoply" description="Frontsiden til Peoply" />
      <Header />
      <div className={styles.container}>
        {eventsFromFollowedOrganizations &&
        eventsFromFollowedOrganizations.length > 0 ? (
          <EventCarousel
            header="Arrangementer fra foreninger du følger"
            seeAllUrl={{ pathname: `/events`, query: followedEventsQuery }}
            events={eventsFromFollowedOrganizations}
            error={
              eventsFromFollowedOrganizationsError || followedArrangersError
            }
          />
        ) : undefined}
        {futureEvents && futureEvents.length > 0 ? (
          <EventCarousel
            header={upcomingHeader}
            seeAllUrl={{ pathname: `/events`, query: eventsQuery }}
            events={futureEvents}
            error={futureEventsError}
          />
        ) : undefined}
        {organizations && organizations.length > 0 && (
          <OrganizationCarousel
            header="Foreninger på IFI"
            seeAllUrl="/orgs"
            organizations={organizations}
            error={organizationsError}
          />
        )}
      </div>
      <Footer />
      <Navbar />
    </>
  );
};

export default Home;
