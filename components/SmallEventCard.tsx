import AddToCalendarButton from "./AddToCalendarButton";
import JoinButton from "./JoinButton";
import { Event } from "../types/types";
import { formatDateRange } from "../utils/functions";

import styles from "../styles/SmallEventCard.module.scss";
import Link from "next/link";
import Image from "next/legacy/image";
import { isEventFinished } from "../utils/event";

import CatImg from "../assets/images/cat.jpg";

interface SmallEventCardProps {
  event: Event;
}

const SmallEventCard = ({ event }: SmallEventCardProps) => {
  const dateString = formatDateRange(
    new Date(event.startDate),
    event.endDate ? new Date(event.endDate) : null,
  );

  return (
    <Link href={`/events/${event.urlId}`}>
      <div className={styles.card}>
        <div className={styles.imageContainer}>
          <Image
            src={event.image ? event.image : CatImg}
            alt="Bildet til arrangementet"
            objectFit="cover"
            layout="fill"
            objectPosition="center"
          />
        </div>
        <div className={styles.dataContainer}>
          <p className={styles.date}>{dateString}</p>
          <h2 className={styles.eventTitle}>{event.title}</h2>
          <p className={styles.eventDescription}>{event.description}</p>
          {!isEventFinished(event) && (
            <div className={styles.actionContainer}>
              <JoinButton
                event={event}
                countdownText="Åpner om"
                joinText="Meld på"
                joinedText="Påmeldt"
                joinWaitlistText="Venteliste"
                joinedWaitlistText="Du står i kø"
                eventFinishedText="Arrangementet er ferdig"
                regClosedText="Påmelding er stengt"
                small
                noShadow
                className={styles.actionButton}
              />
              <AddToCalendarButton
                event={event}
                className={styles.actionButton}
              />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SmallEventCard;
