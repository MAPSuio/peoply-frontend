import Image from "next/image";
import styles from "../styles/EventCard.module.scss";
import CalendarIcon from "./svgs/CalendarIcon";
import LocationIcon from "./svgs/LocationIcon";
import SmileIcon from "./svgs/SmileIcon";
import eventPlaceholder from "../assets/images/undraw_partying.png";
import Link from "next/link";

const EventCard = ({ event }: any) => {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const dateString = formatDateRange(startDate, endDate);
  const timeString = formatTimeRange(startDate, endDate);

  return (
    <Link
      href={{
        pathname: "/event/[event_id]",
        query: { event_id: event.event_id },
      }}
      passHref={true}
    >
      <div className={styles.eventCardContainer}>
        <div className={styles.eventCard}>
          <div className={styles.eventCardImageContainer}>
            {event.image_src ? (
              <Image
                src={event.image_src}
                alt="event image"
                objectFit="contain"
                objectPosition="top"
                placeholder="blur"
              />
            ) : (
              <Image
                src={eventPlaceholder}
                alt="event image"
                objectFit="contain"
                objectPosition="top"
                placeholder="blur"
              />
            )}
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
                      <span>Sted</span>
                      {/* event.location */}
                    </div>
                  </div>
                </div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

function formatDateRange(startDate: Date, endDate: Date) {
  let dateString: string;
  // if start date, month and year is today
  if (
    startDate.getDate() === new Date().getDate() &&
    startDate.getMonth() === new Date().getMonth() &&
    startDate.getFullYear() === new Date().getFullYear()
  ) {
    dateString = `I dag`;
  } else if (startDate.getFullYear() !== endDate.getFullYear()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${startDate.getFullYear()} - ${endDate.getDate()}. ${endDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${endDate.getFullYear()}`;
  } else if (startDate.getMonth() !== endDate.getMonth()) {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} - ${endDate.getDate()}. ${endDate.toLocaleString("default", {
      month: "short",
    })} ${endDate.getFullYear()}`;
  } else if (startDate.getDate() !== endDate.getDate()) {
    dateString = `${startDate.getDate()}. - ${endDate.getDate()}. ${endDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${endDate.getFullYear()}`;
  } else {
    dateString = `${startDate.getDate()}. ${startDate.toLocaleString(
      "default",
      {
        month: "short",
      },
    )} ${startDate.getFullYear()}`;
  }
  return dateString;
}

function formatTimeRange(startDate: Date, endDate: Date) {
  const timeString = `${startDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${endDate.toLocaleString("default", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  return timeString;
}

export default EventCard;
