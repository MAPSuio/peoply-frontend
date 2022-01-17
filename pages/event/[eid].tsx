import Image from "next/image";

import useUser from "../../hooks/useUser";
import useBack from "../../hooks/useBack";
import useWindowDimensions from "../../hooks/useWindowDimensions";

import UserCircle from "../../components/UserCircle";
import DateCircle from "../../components/DateCircle";
import PlaceCircle from "../../components/PlaceCircle";
import SmallCheckCircle from "../../components/SmallCheckCircle";
import PrimaryButton from "../../components/PrimaryButton";
import BackButtonGlass from "../../components/BackButtonGlass";
import HeartIconGlass from "../../components/HeartIconGlass";

import styles from "../../styles/Event.module.scss";
import { getEventData, getTopXEvents } from "../../services/events";
import { Event, EventData } from "../../types/types";
import placeholderImage from "../../assets/images/undraw_partying.png";
import { useState } from "react";

interface EventProps {
  eventData: EventData;
}

const Event = ({ eventData }: EventProps) => {
  const { user } = useUser();
  const goBack = useBack();
  const { width: windowWidth } = useWindowDimensions();

  // TODO: Fetch actual favorited status from the API.
  const [favorited, setFavorited] = useState(false);

  // Extract the relevant event data.
  const {
    dateString: eventDate,
    timeString: eventTime,
    title: eventTitle,
    description: eventDescription,
    capacity: eventCapacity,
    private: eventPrivate,
  } = eventData;

  const imageHeight = windowWidth > 500 ? "30%" : "65%";

  return (
    <div className={styles.eventWrapper}>
      <div className={styles.imageContainer}>
        <BackButtonGlass className={styles.backIcon} onClick={goBack} />
        <HeartIconGlass
          className={styles.favoriteIcon}
          onClick={() => setFavorited(!favorited)}
          favorited={favorited}
        />
        <Image
          src={placeholderImage}
          width="100%"
          height={imageHeight}
          layout="responsive"
          objectFit="cover"
          objectPosition="center top"
          priority
          alt="Nå er det fest!"
        />
      </div>
      <div className={styles.eventContainer}>
        <div className={styles.eventPriceTag}>Gratis</div>
        <div className={styles.eventInfoContainer}>
          <p className={styles.eventTags}>Fest, alkohol, kaffe</p>
          <h1 className={styles.marginBottomSmall}>{eventTitle}</h1>
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
                  {eventDate}
                </p>
                <p className={styles.infoText}>{eventTime}</p>
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
                <span className={styles.emphasis}>{eventCapacity}</span> plasser
                ledig
              </p>
            </div>
          </div>
        </div>
        <div className={styles.descContainer}>
          <h2 className={styles.descHeader}>Informasjon</h2>
          <p className={styles.descText}>{eventDescription}</p>
        </div>
        <PrimaryButton
          text="Meld deg på arrangementet"
          className={styles.primaryButton}
        ></PrimaryButton>
      </div>
    </div>
  );
};

// Build the 10000 most popular events at build time.
export async function getStaticProps({ params }: { params: { eid: number } }) {
  const eventData = await getEventData(params.eid);

  return {
    props: {
      eventData,
    },
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  const top10000Events = await getTopXEvents(10000);
  const paths = top10000Events.map((event: Event) => ({
    params: { eid: `${event.event_numeric_id}` },
  }));

  return { paths, fallback: "blocking" };
}

export default Event;
