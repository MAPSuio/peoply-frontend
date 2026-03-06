// Next.js.
import Image from "next/legacy/image";
import useSWR from "swr";

// Components.
import UserIconCard from "./svgs/UserIconCard";
import PlaceIconCard from "./svgs/PlaceIconCard";
import UsersIconCard from "./svgs/UsersIconCard";

// Utils.
import { formatEventDate } from "../utils/functions";

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

// Types.
import { Event, EventDateFormat, RegStatus } from "../types/types";

// Assets.
import eventPlaceholder from "../assets/images/undraw_partying.png";

// Styles.
import styles from "../styles/EventCard.module.scss";
import SmallCheckCircle from "./SmallCheckCircle";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatEventDate(startDate, endDate, EventDateFormat.SHORT);

  const { data: registrations, error: registrationsError } = useSWR<number>(
    `/events/${event.id}/registration-count?regStatus=${RegStatus.GOING}`,
    fetchFromPeoplyApiJson,
  );

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
          <p className={styles.date}>{dateString}</p>
          <div className={styles.eventCardTitleContainer}>
            <h2 className={styles.title}>{event.title}</h2>
            <div className={styles.usersIconContainer}>
              <UsersIconCard className={styles.icon} />
              <p className={styles.data}>
                <span className={styles.emphasis}>
                  {registrationsError
                    ? "?"
                    : registrations
                    ? registrations
                    : "0"}
                </span>
                {event.capacity !== null && `\u200A/\u200A${event.capacity}`}
              </p>
            </div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.eventCardInfoBody}>
            <div className={styles.eventCardInfoBodyItem}>
              {getArrangerImageOrIcon()}
              <div>
                {event.eventArrangers?.map((a) => (
                  <p className={styles.data} key={a.arranger.id}>
                    {a.arranger.user
                      ? `${a.arranger.user.firstName}`
                      : a.arranger.organization?.name}
                  </p>
                ))}
              </div>
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              {event.eventArrangers &&
                event.eventArrangers[0].arranger.organization?.orgNr && (
                  <SmallCheckCircle purple ultraSmall />
                )}
            </div>
            <div className={styles.eventCardInfoBodyItem}>
              <div className={styles.iconContainer}>
                <PlaceIconCard className={styles.icon} />
              </div>
              <p className={styles.data}>{event.locationName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
