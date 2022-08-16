/* Next. */
import Link from "next/link";
import Image from "next/image";

/* Utils. */
import { formatDateRange, formatTimeRange } from "../utils/functions";

/* Types. */
import { Event, Registration, RegStatus } from "../types/types";

/* Assets. */
import placeholderImage from "../assets/images/undraw_partying.png";
import UsersIcon from "./svgs/UsersIcon";
import TimeIcon from "./svgs/TimeIcon";
import PlaceIcon from "./svgs/PlaceIcon";
import useSWR from "swr";
import { fetchFromPeoplyApiJson } from "../services/fetchers";

/* Styles. */
import styles from "../styles/MyEventCard.module.scss";
import { ShareButton } from "./ShareButton";

interface MyEventCardProps {
  event: Event;
}

const MyEventCard = ({ event }: MyEventCardProps) => {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate).slice(0, -5);
  const timeString = formatTimeRange(startDate, endDate);

  const { data: registrations, error: registrationsError } = useSWR<
    Registration[]
  >(`/events/${event.id}/registrations`, fetchFromPeoplyApiJson);

  const regCt = registrations
    ? registrations.filter((r) => r.regStatus === RegStatus.GOING).length
    : 0;
  const capacity = event.capacity;

  return (
    <Link
      href={{
        pathname: "/event/[eventId]",
        query: { eventId: event.urlId },
      }}
    >
      <a className={styles.cardWrapper}>
        <div className={styles.cardContainer}>
          <div className={styles.imageContainer}>
            <Image
              src={event.image ?? placeholderImage}
              alt="A very cute cat"
              objectFit="cover"
              layout="fill"
              objectPosition="center"
              priority={true}
            />
          </div>
          <div className={styles.contentContainer}>
            <div className={styles.titleContainer}>
              <h3 className={styles.title}>{event.title}</h3>
              <div className={styles.capacityContainer}>
                <UsersIcon className={styles.icon} />
                <p className={styles.data}>
                  <span className={styles.emphasis}>{regCt}</span>
                  {capacity && `\u200A/\u200A${capacity}`}
                </p>
              </div>
            </div>
            <span className={styles.divider} />
            <div className={styles.dataContainer}>
              <div className={styles.iconContainer}>
                <TimeIcon className={styles.icon} />
                <p className={styles.data}>
                  {dateString}, {timeString}
                </p>
              </div>
              <div className={styles.iconContainer}>
                <PlaceIcon className={styles.icon} />
                <p className={styles.data}>Oslo</p>
              </div>
            </div>
            <ShareButton
              width="100%"
              buttonText="Del arrangement"
              shareUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/event/${event.urlId}`}
            />
          </div>
        </div>
      </a>
    </Link>
  );
};

export default MyEventCard;
