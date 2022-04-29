import Image from "next/image";
import { GetStaticProps } from "next";

import { useEffect, useState } from "react";

import UserCircle from "../../components/UserCircle";
import DateCircle from "../../components/DateCircle";
import PlaceCircle from "../../components/PlaceCircle";
import SmallCheckCircle from "../../components/SmallCheckCircle";
import Button from "../../components/Button";
import BackButtonGlass from "../../components/BackButtonGlass";
import HeartIconGlass from "../../components/HeartIconGlass";
import HeadComponent from "../../components/HeadComponent";

import useUser from "../../hooks/useUser";
import useBack from "../../hooks/useBack";
import useWindowDimensions from "../../hooks/useWindowDimensions";

import {
  addFavorite,
  deleteRegistrationUser,
  getEventData,
  getTopXEvents,
  getUserFavorite,
  getUserRegistration,
  registerUser,
  removeFavorite,
} from "../../services/events";

import { ButtonType, Event, RegStatus, SnackTypes } from "../../types/types";
import placeholderImage from "../../assets/images/undraw_partying.png";
import { ParsedUrlQuery } from "querystring";

import styles from "../../styles/Event.module.scss";
import useSnack from "../../hooks/useSnack";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import { formatDateRange, formatTimeRange } from "../../utils/functions";
import useSWR from "swr";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";

interface EventProps {
  event: Event;
  baseUrl: string;
}

const Event = ({ event, baseUrl }: EventProps) => {
  const { user } = useUser();
  const goBack = useBack();
  const { width: windowWidth } = useWindowDimensions();
  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database
  const [registered, setRegistered] = useState(false);
  const [registeredFetched, setRegisteredFetched] = useState(false);
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  const {
    data: eventData,
    error: eventError,
    mutate: updateEvent,
  } = useSWR<Event>(`/events/${event.urlId}`, fetchFromPeoplyApiJson, {
    fallbackData: event,
  });

  /* check if the user has this event as a favorite */
  useEffect(() => {
    const getFavoriteStatus = async () => {
      if (user && eventData) {
        const favorite = await getUserFavorite(user.id, eventData.id);
        setFavorited(favorite !== null);
        setFavoriteFetched(true);
      }
    };

    const getRegisteredStatus = async () => {
      if (user && eventData) {
        const registration = await getUserRegistration(user.id, eventData.id);
        setRegisteredFetched(true);

        if (registration === null) {
          return;
        }

        if (registration.regStatus === RegStatus.GOING) {
          setRegistered(true);
        }
      }
    };

    getRegisteredStatus();
    getFavoriteStatus();
  }, [eventData, user]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const registerForEvent = async () => {
    if (user) {
      const success = await registerUser(
        user.id,
        eventData.id,
        RegStatus.GOING,
      );
      if (success) {
        addSnack("Meldt på arrangement", SnackTypes.SUCCESS);
        setRegistered(true);
      } else {
        addSnack("En feil skjedde under påmelding", SnackTypes.ERROR);
      }

      updateEvent();
      return success;
    }
    return false;
  };

  const unregisterForEvent = async () => {
    if (user) {
      const success = await deleteRegistrationUser(user.id, eventData.id);
      if (success) {
        addSnack("Meldt av arrangement", SnackTypes.WARNING);
        setRegistered(false);
      } else {
        addSnack("En feil skjedde under avmelding", SnackTypes.ERROR);
      }
      updateEvent();
      return success;
    }
    return false;
  };

  const imageHeight =
    windowWidth > 500
      ? windowWidth - windowWidth * 0.65
      : windowWidth - windowWidth * 0.35;

  return (
    <>
      <HeadComponent
        title={`Peoply - ${eventData.title}`}
        description={eventData.description}
        url={`${baseUrl}/event/${eventData.urlId}`}
        // imageUrl=""
      />

      <div className={styles.eventWrapper}>
        <div className={styles.imageContainer}>
          <BackButtonGlass className={styles.backIcon} onClick={goBack} />
          <HeartIconGlass
            className={styles.favoriteIcon}
            onClick={() => {
              if (favoriteFetched) {
                if (user) {
                  if (!favorited) {
                    addFavorite(user.id, eventData.id);
                  } else {
                    removeFavorite(user.id, eventData.id);
                  }
                  setFavorited(!favorited);
                } else {
                  /* user is not logged in */
                  redirectToLogin();
                }
              }
              if (!user) {
                /* User is not logged in. */
                redirectToLogin();
              }
            }}
            favorited={favorited}
          />
          <Image
            src={eventData.image ?? placeholderImage}
            width={windowWidth}
            height={imageHeight}
            objectFit="cover"
            objectPosition="center"
            alt="Nå er det fest!"
          />
        </div>
        <div className={styles.eventContainer}>
          <div className={styles.eventPriceTag}>Gratis</div>
          <div className={styles.eventInfoContainer}>
            <p className={styles.eventTags}>
              {eventData.eventCategories
                ?.map((cat) => cat.category.name)
                .join(", ")}
            </p>
            <h1 className={styles.marginBottomSmall}>{eventData.title}</h1>
            <div className={styles.eventInfoCard}>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <UserCircle />
                <p className={`${styles.infoText} ${styles.emphasis}`}>
                  {eventData.eventArrangers
                    ?.map((a) => {
                      if (a.arranger.user) {
                        return (
                          a.arranger.user.firstName +
                          " " +
                          a.arranger.user.lastName
                        );
                      } else {
                        return a.arranger.organization?.name;
                      }
                    })
                    .join(", ")}
                </p>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <DateCircle />
                <div className={styles.flexContainer}>
                  <p
                    className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                  >
                    {formatDateRange(
                      new Date(eventData.startDate),
                      new Date(eventData.endDate),
                    )}
                  </p>
                  <p className={styles.infoText}>
                    {formatTimeRange(
                      new Date(eventData.startDate),
                      new Date(eventData.endDate),
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomMedium}`}
              >
                <PlaceCircle />
                <div className={styles.flexContainer}>
                  <p
                    className={`${styles.infoText} ${styles.primaryColor} ${styles.marginBottomMini}`}
                  >
                    Gaustadalléen 23B,
                  </p>
                  <p className={`${styles.infoText} ${styles.primaryColor}`}>
                    0373 Oslo
                  </p>
                </div>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <SmallCheckCircle />
                <p className={styles.infoText}>
                  <span className={styles.emphasis}>{`${
                    eventData.registrations?.filter(
                      (r) => r.regStatus === RegStatus.GOING,
                    ).length
                  }${
                    eventData.capacity ? `/${eventData.capacity}` : ""
                  }`}</span>{" "}
                  påmeldte
                </p>
              </div>
            </div>
          </div>
          <div className={styles.descContainer}>
            <h2 className={styles.descHeader}>Informasjon</h2>
            <p className={styles.descText}>{eventData.description}</p>
          </div>
          {registered ? (
            <Button
              type={ButtonType.DANGER}
              text="Meld deg av arrangementet"
              className={styles.primaryButton}
              onClick={() => {
                if (registeredFetched) {
                  if (user) {
                    unregisterForEvent();
                  } else {
                    /* User is not logged in. */
                    redirectToLogin();
                  }
                }
                if (!user) {
                  /* User is not logged in. */
                  redirectToLogin();
                }
              }}
            />
          ) : (
            <Button
              text="Meld deg på arrangementet"
              className={styles.primaryButton}
              onClick={() => {
                if (registeredFetched) {
                  if (user) {
                    registerForEvent();
                  } else {
                    /* User is not logged in. */
                    redirectToLogin();
                  }
                }
                if (!user) {
                  /* User is not logged in. */
                  redirectToLogin();
                }
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  eid: string;
}

/* Build the 10000 most popular events at build time. */
export const getStaticProps: GetStaticProps = async (context) => {
  const { eid } = context.params as IParams;

  const event = await getEventData(eid);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!event) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      baseUrl,
      event,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export async function getStaticPaths() {
  const top10000Events = await getTopXEvents(10000);
  const paths = top10000Events.map((event: Event) => ({
    params: { eid: `${event.urlId}` },
  }));

  return { paths, fallback: "blocking" };
}

export default Event;
