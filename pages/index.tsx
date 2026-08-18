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
/* Swiper's CSS is imported here rather than from the lazy HomeSwipers chunk,
   so it is present at first paint instead of arriving with the carousel.

   Note what this does NOT do: it does not put Swiper's rules before
   Home.module.scss. Turbopack emits them into a later chunk either way -
   moving the import does not change the order, which was verified against the
   built output rather than assumed. The rules that have to win over Swiper's
   win on specificity instead; see the comment in styles/Home.module.scss.

   The ~31 kB of Swiper JS stays lazy. Only the ~3 kB of CSS is eager. */
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

import styles from "../styles/Home.module.scss";
import useUser from "../hooks/useUser";
import { eventWindowBoundary, FRONT_PAGE_GRACE_MS } from "../utils/eventWindow";

/* Swiper is lazy loaded. Every carousel below is gated on SWR data, so none of
   them can render until a fetch resolves - loading Swiper eagerly only moved
   ~40 kB gzipped of it into the first paint of a page that could not use it yet.
   Both point at the same module specifier, so they share one chunk.

   `ssr: false` states what was already true: these never rendered on the server,
   because the data they need is fetched from the client. */
const EventSwiper = dynamic(
  () => import("../components/HomeSwipers").then((m) => m.EventSwiper),
  { ssr: false },
);
const OrganizationSwiper = dynamic(
  () => import("../components/HomeSwipers").then((m) => m.OrganizationSwiper),
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
  /* Floored to the hour, so the SWR key is the same one the last visit used and
     leaving the front page and coming back reads from cache instead of
     refetching. Computed during render rather than in an effect: the effect
     version set it twice and fired two `/events` requests per load. Nothing
     renders the value, so unlike `upcomingHeader` below it cannot produce a
     hydration mismatch by being decided here. */
  const todayString = eventWindowBoundary(FRONT_PAGE_GRACE_MS);
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
          <EventSwiper
            header="Arrangementer fra foreninger du følger"
            seeAllUrl={{ pathname: `/events`, query: followedEventsQuery }}
            events={eventsFromFollowedOrganizations}
            error={
              eventsFromFollowedOrganizationsError || followedArrangersError
            }
          />
        ) : undefined}
        {futureEvents && futureEvents.length > 0 ? (
          <EventSwiper
            header={upcomingHeader}
            seeAllUrl={{ pathname: `/events`, query: eventsQuery }}
            events={futureEvents}
            error={futureEventsError}
          />
        ) : undefined}
        {organizations && organizations.length > 0 && (
          <OrganizationSwiper
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
