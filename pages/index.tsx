// Next.js.
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import dynamic from "next/dynamic";
import useSWR from "swr";

// React.
import { useEffect, useState } from "react";

// Components.
import Navbar from "../components/Navbar";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";

// Services.

// Types.
import { Event, Organization } from "../types/types";
import { ArrangerFollower } from "../types/types";

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

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { user } = useUser();
  const [todayString, setTodayString] = useState<string>(
    new Date().toISOString(),
  );

  useEffect(() => {
    const today = new Date();
    today.setHours(today.getHours() - 2);
    const s = today.toISOString();
    setTodayString(s);
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

  // const { data: eventsOnIFI, error: eventsOnIFIError } = useSWR<Event[]>(
  //   `/events?${queryToString(eventsOnIfiQuery)}`,
  //   fetchFromPeoplyApiJson,
  // );

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
      <HeadComponent
        title="Peoply"
        description="Frontsiden til Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
      <Header showSourceLink />
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
        <div className={styles.calendarEntryCard}>
          <h2>Kalender</h2>
          <Link href="/kalender" className={styles.calendarEntryLink}>
            Åpne kalender
          </Link>
        </div>
        {/* {eventsOnIFI && eventsOnIFI.length > 0 ? (
          <EventSwiper
            header={"Hva skjer på IFI?"}
            seeAllUrl={{ pathname: `/events`, query: eventsOnIfiQuery }}
            events={eventsOnIFI}
            error={eventsOnIFIError}
          />
        ) : undefined}
 */}
        {futureEvents && futureEvents.length > 0 ? (
          <EventSwiper
            header={"Hva skjer fremover?"}
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
      <Navbar />
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Home;
