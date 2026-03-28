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

// Swiper.
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

// Types.
import { UrlObject } from "url";
import { Event, Organization } from "../types/types";
import { ArrangerFollower } from "../types/types";

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
  >(user ? `/users/${user.id}/following` : null, fetchFromPeoplyApiJson);

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
    fetchFromPeoplyApiJson,
  );

  const {
    data: eventsFromFollowedOrganizations,
    error: eventsFromFollowedOrganizationsError,
  } = useSWR<Event[]>(
    followedArrangers && followedArrangers.length > 0
      ? `/events?afterDate=${todayString}&orderBy=startDate&arrangerIds=${followedEventsQuery.arrangerIds}`
      : null,
    fetchFromPeoplyApiJson,
  );

  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(`/organizations?take=20`, fetchFromPeoplyApiJson);

  return (
    <>
      <HeadComponent
        title="Peoply"
        description="Frontsiden til Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
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
        modules={[Mousewheel, FreeMode, Navigation]}
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
        modules={[Mousewheel, FreeMode, Navigation]}
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
