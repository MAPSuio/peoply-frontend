// Next.js.
import Image from "next/legacy/image";

// Components.
import ArrangerAvatar from "./ArrangerAvatar";
import EventActions from "./EventActions";
import { CALENDAR_ANCHOR_ATTRIBUTE } from "./CalendarLinksButton";
import UserIconCard from "./svgs/UserIconCard";
import PlaceIconCard from "./svgs/PlaceIconCard";
import UsersIconCard from "./svgs/UsersIconCard";

// Hooks.
import useRegistrationCount from "../hooks/useRegistrationCount";

// Utils.
import cx from "../utils/cx";
import { formatEventDate } from "../utils/functions";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArrangerOrganization,
} from "../utils/eventArrangers";

// Services.

// Types.
import { type Event, EventDateFormat } from "../types/types";

// Assets.
import eventPlaceholder from "../assets/images/undraw_partying.png";

// Styles.
import styles from "../styles/EventCard.module.scss";
import RegistrationCount from "./RegistrationCount";
import SmallCheckCircle from "./SmallCheckCircle";
import { getEventImage, isEventFinished } from "../utils/event";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatEventDate(startDate, endDate, EventDateFormat.SHORT);

  const {
    data: registrations,
    error: registrationsError,
    mutate: updateRegistrations,
  } = useRegistrationCount(event);

  return (
    <div className={styles.eventCard} {...{ [CALENDAR_ANCHOR_ATTRIBUTE]: "" }}>
      <div className={styles.eventCardImageContainer}>
        <Image
          src={getEventImage(event) ?? eventPlaceholder}
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
            <RegistrationCount event={event}>
              <div className={styles.usersIconContainer}>
                <UsersIconCard className={styles.icon} />
                <p className={styles.data}>
                  <span className={styles.emphasis}>
                    {registrationsError ? "?" : (registrations ?? 0)}
                  </span>
                  {event.capacity !== null && `\u200A/\u200A${event.capacity}`}
                </p>
              </div>
            </RegistrationCount>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.eventCardInfoBody}>
            <div className={styles.eventCardInfoBodyItem}>
              <ArrangerAvatar
                event={event}
                classNames={{
                  image: styles.arrangerImage,
                  iconContainer: styles.iconContainer,
                  icon: styles.icon,
                }}
                fallbackIcon={<UserIconCard className={styles.icon} />}
              />
              <div>
                <p className={styles.data}>
                  {getCompactEventArrangerLabel(event, 2)}
                </p>
              </div>
              {getPrimaryEventArrangerOrganization(event)?.orgNr && (
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
          {!isEventFinished(event) && (
            <div className={styles.actionContainer}>
              <EventActions
                event={event}
                updateOnChange={[updateRegistrations]}
                calendarButtonIconOnly
                joinButtonClassName={styles.actionButton}
                calendarButtonClassName={cx(
                  styles.actionButton,
                  styles.calendarActionButton,
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
