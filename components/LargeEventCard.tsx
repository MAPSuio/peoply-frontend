// Next.js.
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";

// React.
import { MouseEvent, useEffect, useState } from "react";

// Components.
import AddToCalendarButton from "./AddToCalendarButton";
import JoinButton from "./JoinButton";
import HeartIconGlass from "./HeartIconGlass";

// Hooks.
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";
import useRedirectToLogin from "../hooks/useRedirectToLogin";

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import {
  addFavorite,
  getUserFavorite,
  removeFavorite,
} from "../services/events";

// Utils.
import { formatDateRange, formatTimeRange } from "../utils/functions";
import {
  getCompactEventArrangerLabel,
  getPrimaryEventArranger,
} from "../utils/eventArrangers";

// Types.
import { Event, RegStatus, SnackTypes } from "../types/types";

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
  const { user, loading: loadingUser } = useUser();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable the favorite button until we get a response from the database.

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  const dateString = formatDateRange(startDate, endDate).slice(0, -5);
  const timeString = formatTimeRange(startDate, endDate);

  const { data: registrations, mutate: updateRegistrations } = useSWR<number>(
    `/events/${event.id}/registration-count?regStatus=${RegStatus.GOING}`,
    fetchFromPeoplyApiJson,
  );

  useEffect(() => {
    const getFavoriteStatus = async () => {
      if (user) {
        const favorite = await getUserFavorite(user.id, event.id);
        setFavorited(favorite !== null);
        setFavoriteFetched(true);
      } else if (!loadingUser && !user && event) {
        setFavoriteFetched(true);
      }
    };

    getFavoriteStatus();
  }, [user, event, loadingUser]);

  const addFavoriteFunc = async (e: MouseEvent) => {
    e.preventDefault();

    if (user) {
      let success;
      if (!favorited) {
        success = await addFavorite(user.id, event.id);
        if (!success)
          addSnack("Klarte ikke å legge til favoritt", SnackTypes.ERROR);
      } else {
        success = await removeFavorite(user.id, event.id);
        if (!success)
          addSnack("Klarte ikke å fjerne favoritt", SnackTypes.ERROR);
      }

      if (await success) setFavorited(!favorited);
    } else {
      /* User is not logged in. */
      redirectToLogin();
    }
  };

  const getArrangerImageOrIcon = () => {
    if (event.eventArrangers && event.eventArrangers.length > 0) {
      const firstArranger = getPrimaryEventArranger(event);
      if (!firstArranger) {
        return (
          <div className={styles.iconContainer}>
            <UserIconCard className={styles.icon} />
          </div>
        );
      }
      if (firstArranger.user) {
        const imageSrc = firstArranger.user.image;
        if (imageSrc) {
          return (
            <div className={styles.arrangerImage}>
              <Image
                src={imageSrc}
                alt="Arrangøren av arrangementet"
                fill
                sizes="5vw"
                style={{ objectFit: "cover" }}
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
            onClick={addFavoriteFunc}
            favorited={favorited}
            loading={!favoriteFetched}
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
            <h3 className={`${styles.title} ${compact ? styles.compactTitle : ""}`}>
              {event.title}
            </h3>
            <div
              className={`${styles.capacityContainer} ${
                compact ? styles.compactCapacityContainer : ""
              }`}
            >
              <UsersIcon
                className={`${styles.icon} ${compact ? styles.compactIcon : ""} ${styles.marginRightVerySmall}`}
              />
              <p className={`${styles.data} ${compact ? styles.compactData : ""}`}>
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
                {getArrangerImageOrIcon()}
                <div>
                  <span
                    className={`${styles.data} ${compact ? styles.compactData : ""}`}
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
                    className={`${styles.icon} ${compact ? styles.compactIcon : ""}`}
                  />
                </div>
              ) : (
                <TimeIcon
                  className={`${styles.icon} ${compact ? styles.compactIcon : ""} ${styles.marginRightVerySmall}`}
                />
              )}
              <p className={`${styles.data} ${compact ? styles.compactData : ""}`}>
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
                    className={`${styles.icon} ${compact ? styles.compactIcon : ""}`}
                  />
                </div>
              ) : (
                <PlaceIcon
                  className={`${styles.icon} ${compact ? styles.compactIcon : ""} ${styles.marginRightVerySmall}`}
                />
              )}
              <p className={`${styles.data} ${compact ? styles.compactData : ""}`}>
                {event.locationName}
              </p>
            </div>
          </div>
          {!isEventFinished(event) && (
            <div
              className={`${styles.actionContainer} ${
                compact ? styles.compactActionContainer : ""
              } ${
                stackActionsOnDesktop ? styles.stackedActions : ""
              }`}
            >
              <div
                className={`${styles.primaryActions} ${
                  compact ? styles.compactPrimaryActions : ""
                } ${
                  stackActionsOnDesktop ? styles.stackedPrimaryActions : ""
                }`}
              >
                <JoinButton
                  event={event}
                  countdownText="Åpner om"
                  updateOnChange={[updateRegistrations]}
                  joinText="Meld på"
                  joinedText="Påmeldt"
                  joinWaitlistText="Venteliste"
                  joinedWaitlistText="Du står i kø"
                  eventFinishedText="Arrangementet er ferdig"
                  regClosedText="Påmelding er stengt"
                  useUnregisterModal
                  small
                  noShadow
                  className={`${styles.primaryActionButton} ${
                    compact ? styles.compactActionButton : ""
                  }`}
                />
                <AddToCalendarButton
                  event={event}
                  buttonText={compact ? "Kalender" : undefined}
                  width="100%"
                  className={`${styles.secondaryActionButton} ${
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
