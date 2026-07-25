// Next.js.
import Link from "next/link";
import Image from "next/image";

// Components.
import ArrangerAvatar from "./ArrangerAvatar";
import EventActions from "./EventActions";
import HeartIconGlass from "./HeartIconGlass";

// Hooks.
import useEventFavorite from "../hooks/useEventFavorite";
import useRegistrationCount from "../hooks/useRegistrationCount";

// Utils.
import { formatDateRange, formatTimeRange } from "../utils/functions";
import { getCompactEventArrangerLabel } from "../utils/eventArrangers";

// Types.
import { Event } from "../types/types";

// Assets.
import placeholderImage from "../assets/images/undraw_partying.png";
import UsersIcon from "./svgs/UsersIcon";
import TimeIcon from "./svgs/TimeIcon";
import PlaceIcon from "./svgs/PlaceIcon";
import UserIconCard from "./svgs/UserIconCard";

// Styles.
import styles from "../styles/LargeEventCard.module.scss";
import { isEventFinished } from "../utils/event";

interface LargeEventCardProps {
  event: Event;
  showArranger?: boolean;
  stackActionsOnDesktop?: boolean;
  compact?: boolean;
  className?: string;
}

const LargeEventCard = ({
  event,
  showArranger,
  stackActionsOnDesktop = false,
  compact = false,
  className,
}: LargeEventCardProps) => {
  const {
    favorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useEventFavorite(event.id);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate).slice(0, -5);
  const timeString = formatTimeRange(startDate, endDate);

  const { data: registrations, mutate: updateRegistrations } =
    useRegistrationCount(event.id);

  return (
    <Link
      href={{
        pathname: "/events/[eventId]",
        query: { eventId: event.urlId },
      }}
      className={`${styles.cardWrapper} ${
        compact ? styles.compactCardWrapper : ""
      } ${className ?? ""}`}
    >
      <div className={styles.cardContainer}>
        <div
          className={`${styles.imageContainer} ${
            compact ? styles.compactImageContainer : ""
          }`}
        >
          <Image
            src={event.image ?? placeholderImage}
            alt="A very cute cat"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority={true}
          />
          <HeartIconGlass
            className={styles.favoriteIcon}
            onClick={toggleFavorite}
            favorited={favorited}
            loading={favoriteLoading}
          />
        </div>
        <div
          className={`${styles.contentContainer} ${
            compact ? styles.compactContentContainer : ""
          }`}
        >
          <div
            className={`${styles.titleContainer} ${
              compact ? styles.compactTitleContainer : ""
            }`}
          >
            <h3
              className={`${styles.title} ${
                compact ? styles.compactTitle : ""
              }`}
            >
              {event.title}
            </h3>
            <div
              className={`${styles.capacityContainer} ${
                compact ? styles.compactCapacityContainer : ""
              }`}
            >
              <UsersIcon
                className={`${styles.icon} ${
                  compact ? styles.compactIcon : ""
                } ${styles.marginRightVerySmall}`}
              />
              <p
                className={`${styles.data} ${
                  compact ? styles.compactData : ""
                }`}
              >
                <span className={styles.emphasis}>{registrations}</span>
                {event.capacity && `\u200A/\u200A${event.capacity}`}
              </p>
            </div>
          </div>
          <span className={styles.divider} />
          <div
            className={`${styles.dataContainer} ${
              compact ? styles.compactDataContainer : ""
            }`}
          >
            {showArranger && (
              <div className={styles.dataItemContainer}>
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
                  <span
                    className={`${styles.data} ${
                      compact ? styles.compactData : ""
                    }`}
                  >
                    {getCompactEventArrangerLabel(event, 2)}
                  </span>
                </div>
              </div>
            )}
            <div className={styles.dataItemContainer}>
              {showArranger ? (
                <div
                  className={`${styles.iconContainer} ${
                    compact ? styles.compactIconContainer : ""
                  }`}
                >
                  <TimeIcon
                    className={`${styles.icon} ${
                      compact ? styles.compactIcon : ""
                    }`}
                  />
                </div>
              ) : (
                <TimeIcon
                  className={`${styles.icon} ${
                    compact ? styles.compactIcon : ""
                  } ${styles.marginRightVerySmall}`}
                />
              )}
              <p
                className={`${styles.data} ${
                  compact ? styles.compactData : ""
                }`}
              >
                {dateString}, {timeString}
              </p>
            </div>
            <div className={styles.dataItemContainer}>
              {showArranger ? (
                <div
                  className={`${styles.iconContainer} ${
                    compact ? styles.compactIconContainer : ""
                  }`}
                >
                  <PlaceIcon
                    className={`${styles.icon} ${
                      compact ? styles.compactIcon : ""
                    }`}
                  />
                </div>
              ) : (
                <PlaceIcon
                  className={`${styles.icon} ${
                    compact ? styles.compactIcon : ""
                  } ${styles.marginRightVerySmall}`}
                />
              )}
              <p
                className={`${styles.data} ${
                  compact ? styles.compactData : ""
                }`}
              >
                {event.locationName}
              </p>
            </div>
          </div>
          {!isEventFinished(event) && (
            <div
              className={`${styles.actionContainer} ${
                compact ? styles.compactActionContainer : ""
              } ${stackActionsOnDesktop ? styles.stackedActions : ""}`}
            >
              <div
                className={`${styles.primaryActions} ${
                  compact ? styles.compactPrimaryActions : ""
                } ${stackActionsOnDesktop ? styles.stackedPrimaryActions : ""}`}
              >
                <EventActions
                  event={event}
                  updateOnChange={[updateRegistrations]}
                  useUnregisterModal
                  calendarButtonText={compact ? "Kalender" : undefined}
                  joinButtonClassName={`${styles.primaryActionButton} ${
                    compact ? styles.compactActionButton : ""
                  }`}
                  calendarButtonClassName={`${styles.secondaryActionButton} ${
                    compact ? styles.compactActionButton : ""
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LargeEventCard;
