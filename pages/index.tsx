// Next.js.
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

// React.
import { useEffect, useState } from "react";

// Components.
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import OrganizationAvatar from "../components/OrganizationAvatar";
import HighlightedEventCard from "../components/HighlightedEventCard";

// Swiper.
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";
import SwiperCore, {
  Scrollbar,
  Mousewheel,
  FreeMode,
  Navigation,
} from "swiper";
SwiperCore.use([Scrollbar, Mousewheel, FreeMode, Navigation]); // Install swiper modules.

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

// Utils.
import { queryToString } from "../utils/functions";

// Types.
import { UrlObject } from "url";
import { ArrangerFollower, Event, Organization } from "../types/types";

// Styles.
import styles from "../styles/Home.module.scss";
import useUser from "../hooks/useUser";

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { user } = useUser();
  const [todayString, setTodayString] = useState<string>(
    new Date().toISOString(),
  );

  const { data: followedArrangers, error: followedArrangersError } = useSWR<
    ArrangerFollower[]
  >(user ? `/users/${user.id}/following` : null, fetchFromPeoplyApiJson);

  useEffect(() => {
    const today = new Date();
    today.setHours(today.getHours() - 2);
    const s = today.toISOString();
    setTodayString(s);
  }, []);

  const featuredEventsQuery = {
    featured: true,
    afterDate: todayString,
    orderBy: "startDate",
  };

  const eventsQuery = {
    afterDate: todayString,
    orderBy: "startDate",
  };

  // temporary list before we get a solution for the API
  // temporary list before we get a solution for the API
  const ifiOrgs = [
    "990110352", // CYB
    "990995303", // navet
    "987042583", // dagen
    "911594242", // Ifi-Progsys
    "915439721", // Defi
    "919650354", // Digitus
    "997875400", // Språktek
    "991739815", // mikro
    "995251884", // MAPS
    "920547230", // Toastjærn
    "928728854", // readLine
    "996784991", // FUI
    "998088062", // FIFI
    "934263286", // Quizifi
    "934136306", // Ifi Rastløs
    "913439511", // Fadderstyret
    "932075024", // RealitIFI
    "815417712", // >Output
    "923423834", // VIFI
    "929168097", // SIFI
    "919793678", // PiTCH
    "934357124", //PGA IFI
  ];

  // const eventsOnIfiQuery = { ...eventsQuery, categoryIds: "3" }; // IFI category id
  const eventsFromFollowedArrangersQuery = {
    ...eventsQuery,
    arrangerIds: followedArrangers?.map((a) => a.arrangerId),
  };
  const ifiOrgsQuery = { orgNrs: ifiOrgs.join(","), take: 20 };

  // const { data: eventsOnIFI, error: eventsOnIFIError } = useSWR<Event[]>(
  //   `/events?${queryToString(eventsOnIfiQuery)}`,
  //   fetchFromPeoplyApiJson,
  // );

  const { data: futureEvents, error: futureEventsError } = useSWR<Event[]>(
    `/events?${queryToString(eventsQuery)}`,
    fetchFromPeoplyApiJson,
  );

  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(`/organizations?${queryToString(ifiOrgsQuery)}`, fetchFromPeoplyApiJson);

  const { data: featuredEvents, error: featuredEventsError } = useSWR<Event[]>(
    `/events?${queryToString(featuredEventsQuery)}`,
    fetchFromPeoplyApiJson,
  );

  const {
    data: eventsFromFollowedArrangers,
    error: eventsFromFollowedArrangersError,
  } = useSWR<Event[]>(
    followedArrangers && followedArrangers.length > 0
      ? `/events?${queryToString(eventsFromFollowedArrangersQuery)}`
      : null,
    fetchFromPeoplyApiJson,
  );

  return (
    <>
      <HeadComponent
        title="Peoply"
        description="Frontsiden til Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
      <Header />
      <div className={styles.container}>
        {featuredEvents && featuredEvents.length > 0 && (
          <HighlightedEventCard event={featuredEvents[0]} />
        )}
        {organizations && organizations.length > 0 && (
          <OrganizationSwiper
            header="Foreninger på IFI"
            seeAllUrl={{ pathname: "/orgs", query: ifiOrgsQuery }}
            organizations={organizations}
            error={organizationsError}
          />
        )}
        {eventsFromFollowedArrangers && eventsFromFollowedArrangers.length > 0 && (
          <EventSwiper
            header="Fra arrangører du følger"
            seeAllUrl={{
              pathname: "/events",
              query: eventsFromFollowedArrangersQuery,
            }}
            events={eventsFromFollowedArrangers}
            error={eventsFromFollowedArrangersError}
          />
        )}
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
      </div>
      <Navbar />
    </>
  );
};

interface EventSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  events: Event[];
  error: Error | null;
}

const EventSwiper = ({
  header,
  seeAllUrl,
  events,
  error,
}: EventSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h1>{header}</h1>
        <Link href={seeAllUrl} className={styles.link}>
          Se alle
        </Link>
      </div>
      <Swiper
        className={styles.mySwiper}
        mousewheel={{ forceToAxis: true }}
        spaceBetween={16}
        slidesPerView={"auto"}
        freeMode={{ enabled: true }}
      >
        {events?.map((event: any) => (
          <SwiperSlide key={event.urlId} className={styles.mySwiperSlide}>
            <Link
              href={{
                pathname: "/events/[eventId]",
                query: { eventId: event.urlId },
              }}
            >
              <EventCard event={event} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

interface OrganizationSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  organizations: Organization[];
  error: Error | null;
}
const OrganizationSwiper = ({
  header,
  seeAllUrl,
  organizations,
  error,
}: OrganizationSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h1>{header}</h1>
        <Link href={seeAllUrl} className={styles.link}>
          Se alle
        </Link>
      </div>
      <Swiper
        className={styles.mySwiper}
        mousewheel={{ forceToAxis: true }}
        spaceBetween={16}
        slidesPerView={"auto"}
        freeMode={{ enabled: true }}
      >
        {organizations?.map((organization: Organization) => (
          <SwiperSlide key={organization.id} className={styles.swiperSlideOrg}>
            <Link href={`/orgs/${organization.urlId ?? organization.id}`}>
              <OrganizationAvatar organization={organization} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
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
