// Next.js.
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

// React.
import { useState } from "react";

// Components.
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";

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

// Styles.
import styles from "../styles/Home.module.scss";
import { Event } from "../types/types";
import { UrlObject } from "url";
import { queryToString } from "../utils/functions";

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [today] = useState(new Date().toISOString());
  const router = useRouter();

  const eventsQuery = {
    afterDate: today,
    orderBy: "startDate",
  };

  const eventsOnIfiQuery = { ...eventsQuery, categoryIds: "3" };
  const eventsOnUioQuery = { ...eventsQuery, categoryIds: "1" };

  const { data: eventsOnIFI, error: eventsOnIFIError } = useSWR<Event[]>(
    `/events?${queryToString(eventsOnIfiQuery)}`,
    fetchFromPeoplyApiJson,
  );
  const { data: eventsOnUiO, error: eventsOnUiOError } = useSWR<Event[]>(
    `/events?${queryToString(eventsOnUioQuery)}`,
    fetchFromPeoplyApiJson,
  );
  const { data: futureEvents, error: futureEventsError } = useSWR<Event[]>(
    `/events?${queryToString(eventsQuery)}`,
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
        {eventsOnIFI && eventsOnIFI.length > 0 ? (
          <EventSwiper
            header={"Hva skjer på IFI?"}
            seeAllUrl={{ pathname: `/events`, query: eventsOnIfiQuery }}
            events={eventsOnIFI}
            error={eventsOnIFIError}
          />
        ) : undefined}
        {eventsOnUiO && eventsOnUiO.length > 0 ? (
          <EventSwiper
            header={"Hva skjer på UiO?"}
            seeAllUrl={{ pathname: `/events`, query: eventsOnUioQuery }}
            events={eventsOnUiO}
            error={eventsOnUiOError}
          />
        ) : undefined}
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
        <Link href={seeAllUrl}>
          <a className={styles.link}>Se alle</a>
        </Link>
      </div>
      <Swiper
        className={styles.mySwiper}
        scrollbar={{ draggable: true, hide: true }}
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
              <a>
                <EventCard event={event} />
              </a>
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
