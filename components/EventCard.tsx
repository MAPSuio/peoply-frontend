import Image from "next/image";
import styles from "../styles/EventCard.module.scss";
import CalendarIcon from "./svgs/CalendarIcon";
import LocationIcon from "./svgs/LocationIcon";
import SmileIcon from "./svgs/SmileIcon";
import eventPlaceholder from "../assets/images/undraw_partying.png";
import Link from "next/link";
import { formatDateRange, formatTimeRange } from "../utils/functions";
import { Event } from "../types/types";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate);
  const timeString = formatTimeRange(startDate, endDate);

  return (
    <div className={styles.eventCardContainer}>
      <div className={styles.eventCard}>
        <div className={styles.eventCardImageContainer}>
          <Image
            src={event.image ?? eventPlaceholder}
            layout="fill"
            alt="event image"
            objectFit="cover"
            objectPosition="center"
            /* This is black magic. This is the only configuration where the size is 384px on both desktop and mobile */
            sizes="(max-width: 500px) 30vw, 384px"
          />
        </div>
        <div className={styles.eventCardInfoContainer}>
          <div className={styles.eventCardInfo}>
            <div className={styles.eventCardInfoHeaderContainer}>
              <h2>{event.title}</h2>
              <div className={styles.eventCardInfoHeaderPriceContainer}>
                <SmileIcon />
                <span>Pris</span>
                {/* Price */}
              </div>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.eventCardInfoBodyContainer}>
              <div className={styles.eventCardInfoBody}>
                <div>
                  <div className={styles.eventCardInfoBodyItem}>
                    <CalendarIcon />
                    <div>
                      <span>{dateString}</span>
                      <span>{timeString}</span>
                    </div>
                  </div>
                  <div className={styles.eventCardInfoBodyItem}>
                    <LocationIcon />
                    <span>{event.locationName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
