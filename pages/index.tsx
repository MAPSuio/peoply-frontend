import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
import useSWR from "swr";

import EventCard from "../components/EventCard";
import styles from "../styles/Home.module.scss";
import fetcher from "../hooks/fetcher";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

// import Swiper core and required modules
import SwiperCore, {
  Scrollbar,
  Mousewheel,
  FreeMode,
  Navigation,
} from "swiper";

// install Swiper modules
SwiperCore.use([Scrollbar, Mousewheel, FreeMode, Navigation]);
import Header from "../components/Header";
import { useState } from "react";
import HeadComponent from "../components/HeadComponent";
import { useRouter } from "next/router";

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const [today] = useState(new Date().toISOString());
  const { data: futureEvents, error: futureEventsError } = useSWR(
    `/events?afterDate=${today}`,
    fetcher,
  );
  const { data: previousEvents, error: previousEventsError } = useSWR(
    `/events?beforeDate=${today}&orderDirection=desc`,
    fetcher,
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
    </>
  );
};

const EventSwiper = ({ header, seeAllUrl, events, error }: any) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h1>{header}</h1>
        <Link href={seeAllUrl}>Se alle</Link>
      </div>
      <Swiper
        freeMode={true}
        className={styles.mySwiper}
        scrollbar={{ draggable: true, hide: true }}
        direction={"horizontal"}
        mousewheel={{ forceToAxis: true }}
        spaceBetween={16}
        slidesPerView={"auto"}
      >
        {events?.map((event: any) => (
          <SwiperSlide
            key={event.event_numeric_id}
            className={styles.mySwiperSlide}
          >
            <EventCard event={event} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Home;
