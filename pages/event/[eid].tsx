import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";

import useUser from "../../hooks/useUser";

import UserCircle from "../../components/UserCircle";
import DateCircle from "../../components/DateCircle";
import PlaceCircle from "../../components/PlaceCircle";
import SmallCheckCircle from "../../components/SmallCheckCircle";
import ConfirmButton from "../../components/ConfirmButton";
import BackButtonGlass from "../../components/BackButtonGlass";
import HeartIconGlass from "../../components/HeartIconGlass";

import styles from "../../styles/Event.module.scss";
import { getTopXEvents } from "../../services/events";
import { Event } from "../../types/types";

const Event: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  // Get event ID.
  const { eid } = router.query;

  return (
    <div className={styles.eventWrapper}>
      <div className={styles.imageContainer}>
        <BackButtonGlass classes={styles.backIcon} />
        <HeartIconGlass classes={styles.favoriteIcon} />
        <Image
          src={"/assets/undraw_partying.png"}
          width="100%"
          height="65%"
          layout="responsive"
          objectFit="cover"
          objectPosition="center top"
          alt="Nå er det fest!"
        />
      </div>
      <div className={styles.eventContainer}>
        <div className={styles.eventPriceTag}>Gratis</div>
        <div className={styles.eventInfoContainer}>
          <p className={styles.eventTags}>Fest, alkohol, kaffe</p>
          <h1 className={styles.marginBottomSmall}>Escape fest</h1>
          <div className={styles.eventInfoCard}>
            <div
              className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
            >
              <UserCircle />
              <p className={`${styles.infoText} ${styles.emphasis}`}>
                Cybernetisk selskab
              </p>
            </div>
            <div
              className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
            >
              <DateCircle />
              <div className={styles.flexContainer}>
                <p
                  className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                >
                  Lør, 10.10.2021
                </p>
                <p className={styles.infoText}>18:00 - 01:00</p>
              </div>
            </div>
            <div
              className={`${styles.infoTextContainer} ${styles.marginBottomMedium}`}
            >
              <PlaceCircle />
              <div className={styles.flexContainer}>
                <p
                  className={`${styles.infoText} ${styles.primaryColor} ${styles.marginBottomMini}`}
                >
                  Gaustadalléen 23B,
                </p>
                <p className={`${styles.infoText} ${styles.primaryColor}`}>
                  0373 Oslo
                </p>
              </div>
            </div>
            <div
              className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
            >
              <SmallCheckCircle />
              <p className={styles.infoText}>
                <span className={styles.emphasis}>20</span> plasser ledig
              </p>
            </div>
          </div>
        </div>
        <div className={styles.descContainer}>
          <h2 className={styles.descHeader}>Informasjon</h2>
          <p className={styles.descText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
            iaculis interdum enim et rhoncus. <br></br>
            <br></br>Fusce porttitor imperdiet nunc nec faucibus. Ut dapibus
            lacinia purus a malesuada. Sed imperdiet ligula id accumsan
            pellentesque.
          </p>
        </div>
        <ConfirmButton
          onClick={() => console.log("clicked")}
          text="Meld deg på arrangementet"
          className={styles.confirmButton}
        ></ConfirmButton>
      </div>
    </div>
  );
};

// Build the 10000 most popular events at build time.
export async function getStaticProps() {
  const res = await fetch(`${process.env.API_URL}/events?take=10000`);
  const events = await res.json();

  return {
    props: {
      events,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const top10000Events = await getTopXEvents(10000);
  const paths: Array<object> = top10000Events.map((event: any) => {
    params: {
      eid: event.id;
    }
  });

  return { paths, fallback: "true" };
}

async function getEventData(eid: number) {
  const eventUrl = `${process.env.API_URL}/events/${eid}`;
  const res = await fetch(eventUrl, { method: "GET", credentials: "include" });
  const eventData = await res.json();

  // Extract event data and format in new object.
  const startDate = new Date(eventData.start_date);
  const endDate = new Date(eventData.end_Date);
  const event: Event = {
    event_id: eid,
    start_date: eventData.start_date,
    end_date: eventData.end_date,
    title: eventData.title,
    description: eventData.description,
    capacity: eventData.capacity,
  };

  return event;
}

export default Event;
