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

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [today] = useState(new Date().toISOString());
  const router = useRouter();
  const { data: futureEvents, error: futureEventsError } = useSWR(
    `/events?afterDate=${today}`,
    fetchFromPeoplyApiJson,
  );
  const { data: previousEvents, error: previousEventsError } = useSWR(
    `/events?beforeDate=${today}&orderDirection=desc`,
    fetchFromPeoplyApiJson,
  );

  return (
    <>
      <HeadComponent
        title="Peoply - Home"
        description="Home page of Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
      <Header />
      <div className={styles.container}>
        <EventSwiper
          header={"Hva skjer fremover?"}
          seeAllUrl={{ pathname: "/events" }}
          events={futureEvents}
          error={futureEventsError}
        />
        <EventSwiper
          header={"Hva du gikk glipp av"}
          seeAllUrl={{ pathname: "/events" }}
          events={previousEvents}
          error={previousEventsError}
        />
      </div>
      <Navbar />
    </>
  );
};

interface EventSwiperProps {
  header: string;
  seeAllUrl: { pathname: string };
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
      >
        {events?.map((event: any) => (
          <SwiperSlide key={event.urlId} className={styles.mySwiperSlide}>
            <Link
              href={{
                pathname: "/event/[eventId]",
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
