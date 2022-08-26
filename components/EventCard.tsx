// Next.js.
import Image from "next/image";

// Components.
// import SmileIconCard from "./svgs/SmileIconCard";
import CalendarIconCard from "./svgs/CalendarIconCard";
import UserIconCard from "./svgs/UserIconCard";
import PlaceIconCard from "./svgs/PlaceIconCard";

// Utils.
import { formatDateRange, formatTimeRange } from "../utils/functions";

// Types.
import { Event } from "../types/types";

// Assets.
import eventPlaceholder from "../assets/images/undraw_partying.png";

// Styles.
import styles from "../styles/EventCard.module.scss";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate);
  const timeString = formatTimeRange(startDate, endDate);

  const getArrangerImageOrIcon = () => {
    if (event.eventArrangers && event.eventArrangers.length > 0) {
      const firstArranger = event.eventArrangers[0].arranger;
      if (firstArranger.user) {
        const imageSrc = firstArranger.user.image;
        if (imageSrc) {
          return (
            <div className={styles.arrangerImage}>
              <Image
                src={imageSrc}
                layout="fill"
                alt="Arrangøren av arrangementet"
                objectFit="cover"
                sizes="5vw"
              />
            </div>
          );
        } else {
          return (
            <div className={styles.iconContainer}>
              <UserIconCard className={styles.icon} />
            </div>
          );
        }
      } else {
        const imageSrc = firstArranger.organization?.image;
        if (imageSrc) {
          return (
            <div className={styles.arrangerImage}>
              <Image
                src={imageSrc}
                layout="fill"
                alt="Arrangøren av arrangementet"
                objectFit="cover"
                sizes="5vw"
              />
            </div>
          );
        } else {
          return (
            <div className={styles.iconContainer}>
              <UserIconCard className={styles.icon} />
            </div>
          );
        }
      }
    } else {
      return (
        <div className={styles.iconContainer}>
          <UserIconCard className={styles.icon} />
        </div>
      );
    }
  };

  return (
    <div className={styles.eventCardContainer}>
      <div className={styles.eventCard}>
        <div className={styles.eventCardImageContainer}>
          <Image
            src={event.image ?? eventPlaceholder}
            layout="fill"
            alt="Noe som forhåpentligvis beskriver arrangementet"
            objectFit="cover"
            /* This is black magic. This is the only configuration where the size is 384px on both desktop and mobile */
            sizes="(max-width: 500px) 30vw, 384px" // TODO: Consider tweaking this.
          />
        </div>
        <div className={styles.eventCardInfoContainer}>
          <div className={styles.eventCardInfo}>
            <div className={styles.eventCardInfoHeaderContainer}>
              <h2 className={styles.title}>{event.title}</h2>
              {/* <div className={styles.eventCardInfoHeaderPriceContainer}>
                <SmileIconCard className={styles.icon} />
                <span>Gratis</span>
              </div> */}
            </div>
            <div className={styles.divider}></div>
            <div className={styles.eventCardInfoBodyContainer}>
              <div className={styles.eventCardInfoBody}>
                <div>
                  <div className={styles.eventCardInfoBodyItem}>
                    {getArrangerImageOrIcon()}
                    <div>
                      {event.eventArrangers?.map((a) => (
                        <span key={a.arranger.id}>
                          {a.arranger.user
                            ? `${a.arranger.user.firstName}`
                            : a.arranger.organization?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={styles.eventCardInfoBodyItem}>
                    <div className={styles.iconContainer}>
                      <CalendarIconCard className={styles.icon} />
                    </div>
                    <div>
                      <span>{dateString}</span>
                      <span>{timeString}</span>
                    </div>
                  </div>
                  <div className={styles.eventCardInfoBodyItem}>
                    <div className={styles.iconContainer}>
                      <PlaceIconCard className={styles.icon} />
                    </div>
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
