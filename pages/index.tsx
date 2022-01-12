import type { NextPage } from "next";
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

const Home: NextPage = () => {
  const { data: todayEvents, error: todayEventsError } = useSWR(
    "/events",
    fetcher,
  );
  const { data: popularEvents, error: popularEventsError } = useSWR(
    "/events",
    fetcher,
  );

  return (
    <div className={styles.container}>
      <EventSwiper
        header={"Hva skjer i dag?"}
        seeAllUrl={{ pathname: "/events" }}
        events={todayEvents}
        error={todayEventsError}
      />
      <EventSwiper
        header={"Mest populære"}
        seeAllUrl={{ pathname: "/events" }}
        events={popularEvents}
        error={popularEventsError}
      />
    </div>
  );
};

const EventSwiper = ({ header, seeAllUrl, events, error }: any) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h2>{header}</h2>
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
          <SwiperSlide key={event.event_id} className={styles.mySwiperSlide}>
            <EventCard event={event} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Home;
