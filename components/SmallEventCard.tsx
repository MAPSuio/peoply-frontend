import AddToCalendarButton from "./AddToCalendarButton";
import { Event } from "../types/types";
import { formatDateRange } from "../utils/functions";

import styles from "../styles/SmallEventCard.module.scss";
import Link from "next/link";
import Image from "next/legacy/image";

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
          <div className={styles.actionContainer}>
            <AddToCalendarButton event={event} />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SmallEventCard;
