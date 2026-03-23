// Next.js.
import useSWR from "swr";
import Image from "next/legacy/image";
import Link from "next/link";

// React.
import { useEffect, useState } from "react";

// Components.
import AddToCalendarButton from "./AddToCalendarButton";
import Avatar from "./Avatar";
import CalendarIconCard from "./svgs/CalendarIconCard";
import HeartIconGlass from "./HeartIconGlass";
import JoinButton from "./JoinButton";

// Hooks.
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";
import useRedirectToLogin from "../hooks/useRedirectToLogin";

// Services.
import { formatDateRange, formatTimeRange } from "../utils/functions";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import {
  addFavorite,
  getUserFavorite,
  removeFavorite,
} from "../services/events";

// Types.
import { Event, RegStatus, SnackTypes } from "../types/types";

// Assets.
import UsersIconCard from "./svgs/UsersIconCard";
import PlaceIconCard from "./svgs/PlaceIconCard";
import HeartIcon from "./svgs/HeartIcon";
import CatImg from "../assets/images/cat.jpg";

// Styles.
import styles from "../styles/HighlightedEventCard.module.scss";

interface HighlightedEventCardProps {
  event: Event;
}

const HighlightedEventCard = ({ event }: HighlightedEventCardProps) => {
  const { addSnack } = useSnack();
  const { user, loading: loadingUser } = useUser();
  const redirectToLogin = useRedirectToLogin();

  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database

  const {
    data: registrations,
    error: registrationsError,
    mutate: updateRegistrations,
  } = useSWR<number>(
    `/events/${event.id}/registration-count?regStatus=${RegStatus.GOING}`,
    fetchFromPeoplyApiJson,
  );

  const arranger = (() => {
    if (event.eventArrangers && event.eventArrangers.length > 0) {
      const org = event.eventArrangers[0].arranger.organization;
      const user = event.eventArrangers[0].arranger.user;

      if (org !== null) {
        return {
          org: org,
          user: undefined,
          markup: (
            <>
              <Avatar org={org} size="medium" />
              <div className={styles.headingContainer}>
                <p className={styles.tag}>Uthevet arrangement fra</p>
                <h1 className={styles.title}>{org?.name}</h1>
              </div>
            </>
          ),
        };
      } else if (user !== null) {
        return {
          org: undefined,
          user: user,
          markup: (
            <>
              <Avatar user={user} size="medium" />
              <div className={styles.headingContainer}>
                <p className={styles.tag}>Uthevet arrangement fra</p>
                <h1
                  className={styles.title}
                >{`${user?.firstName} ${user?.lastName}`}</h1>
              </div>
            </>
          ),
        };
      }
    }

    return undefined;
  })();

  useEffect(() => {
    const getFavoriteStatus = async () => {
      if (user && event) {
        const favorite = await getUserFavorite(user.id, event.id);
        setFavorited(favorite !== null);
        setFavoriteFetched(true);
      } else if (!loadingUser && !user && event) {
        setFavoriteFetched(true);
      }
    };

    getFavoriteStatus();
  }, [event, user, loadingUser]);

  if (!event) {
    return <div>Loading...</div>;
  }

  const addFavoriteFunc = async () => {
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

  const dateString = formatDateRange(
    new Date(event.startDate),
    event.endDate ? new Date(event.endDate) : null,
  );
  const timeString = formatTimeRange(
    new Date(event.startDate),
    event.endDate ? new Date(event.endDate) : null,
  );

  return (
    <div className={styles.container}>
      <Link
        href={
          arranger?.org
            ? `/orgs/${arranger?.org.urlId ?? arranger?.org.id}`
            : `/users/${arranger?.user?.id}`
        }
      >
        <div className={styles.headingAndAvatarContainer}>
          {arranger?.markup}
        </div>
      </Link>
      <Link href={`/events/${event.urlId}`}>
        <div className={styles.card}>
          <button
            className={styles.button}
            disabled={!favoriteFetched}
            onClick={(ev) => {
              ev.preventDefault();
              addFavoriteFunc();
            }}
          >
            <HeartIcon
              className={`${styles.favoriteIcon} ${
                favorited && styles.favorited
              }`}
            />
          </button>
          <HeartIconGlass
            className={styles.favoriteIconGlass}
            onClick={(ev) => {
              ev.preventDefault();
              addFavoriteFunc();
            }}
            favorited={favorited}
            loading={!favoriteFetched}
          />
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
            <div className={styles.row}>
              <h2 className={styles.eventTitle}>{event.title}</h2>
              <p className={styles.eventDescription}>{event.description}</p>
              <div className={styles.divider}></div>
              <div className={styles.iconWrapper}>
                <div className={styles.iconContainer}>
                  <CalendarIconCard className={styles.icon} />
                  <p
                    className={styles.data}
                  >{`${dateString}, ${timeString}`}</p>
                </div>
                <div className={styles.iconContainer}>
                  <PlaceIconCard className={styles.icon} />
                  <p className={`${styles.data} ${styles.hideOverflow}`}>
                    {event.locationName}
                  </p>
                </div>
                <div className={styles.iconContainer}>
                  <UsersIconCard className={styles.icon} />
                  <p className={styles.data}>
                    <span className={styles.emphasis}>
                      {registrationsError
                        ? "?"
                        : registrations
                        ? registrations
                        : "0"}
                    </span>
                    {event.capacity && `\u200A/\u200A${event.capacity}`}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.actionContainer}>
              <JoinButton
                event={event}
                countdownText="Åpner om"
                updateOnChange={[updateRegistrations]}
                joinText="Meld deg på"
                joinedText="Du er påmeldt"
                joinWaitlistText="Stell deg i kø"
                joinedWaitlistText="Du står i kø"
                eventFinishedText="Arrangementet er ferdig"
                regClosedText="Påmelding er stengt"
                useUnregisterModal
                small
                noShadow
                className={styles.primaryButton}
              />
              <AddToCalendarButton event={event} width="100%" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HighlightedEventCard;
