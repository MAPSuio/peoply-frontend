/* Next. */
import Link from "next/link";
import Image from "next/image";

/* Hooks. */
import useSnack from "../hooks/useSnack";

/* Utils. */
import { formatDateRange, formatTimeRange } from "../utils/functions";

/* Types. */
import { Event, SnackTypes } from "../types/types";

/* Assets. */
import PlaceholderImage from "../assets/images/cat.jpg";
import UsersIcon from "./svgs/UsersIcon";
import TimeIcon from "./svgs/TimeIcon";
import PlaceIcon from "./svgs/PlaceIcon";
import PrimaryButton from "./PrimaryButton";
import useSWR from "swr";
import { fetchFromPeoplyApi } from "../services/fetchers";

/* Styles. */
import styles from "../styles/MyEventCard.module.scss";

interface MyEventCardProps {
  event: Event;
}

const MyEventCard = ({ event }: MyEventCardProps) => {
  const { addSnack } = useSnack();

  const buttonOnClick = (e: MouseEvent) => {
    e.stopPropagation();

    navigator.clipboard.writeText(
      `${process.env.NEXT_PUBLIC_BASE_URL}/event/${event.urlId}`,
    );

    addSnack("Lenken ble kopiert!", SnackTypes.SUCCESS);
  };

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const dateString = formatDateRange(startDate, endDate).slice(0, -5);
  const timeString = formatTimeRange(startDate, endDate);

  const { data: registrations, error: registrationsError } = useSWR(
    `/events/${event.id}/registrations`,
    fetchFromPeoplyApi,
  );
  const regCt = registrations ? registrations.length : 0;
  const capacity = event.capacity;

  return (
    <Link
      href={{
        pathname: "/event/[eventId]",
        query: { eventId: event.urlId },
      }}
      passHref={true}
    >
      <div className={styles.cardWrapper}>
        <div className={styles.cardContainer}>
          <div className={styles.imageContainer}>
            <Image
              src={PlaceholderImage}
              alt="A very cute cat"
              objectFit="cover"
              layout="fill"
              objectPosition="center"
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
            <PrimaryButton
              text="Kopier lenke"
              small
              className={styles.iconLink}
              onClick={(e: MouseEvent) => buttonOnClick(e)}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MyEventCard;
