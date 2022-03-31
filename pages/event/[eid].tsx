import Image from "next/image";
import { Router, useRouter } from "next/router";
import { GetStaticProps } from "next";

import { useEffect, useState } from "react";

import UserCircle from "../../components/UserCircle";
import DateCircle from "../../components/DateCircle";
import PlaceCircle from "../../components/PlaceCircle";
import SmallCheckCircle from "../../components/SmallCheckCircle";
import PrimaryButton from "../../components/PrimaryButton";
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

import { Event, EventData, RegStatus, SnackTypes } from "../../types/types";
import placeholderImage from "../../assets/images/undraw_partying.png";
import { ParsedUrlQuery } from "querystring";

import styles from "../../styles/Event.module.scss";
import useSnack from "../../hooks/useSnack";

interface EventProps {
  eventData: EventData;
  baseUrl: string;
}

const Event = ({ eventData, baseUrl }: EventProps) => {
  const { user } = useUser();
  const goBack = useBack();
  const { width: windowWidth } = useWindowDimensions();
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database
  const [registered, setRegistered] = useState(false);
  const [registeredFetched, setRegisteredFetched] = useState(false);
  const { addSnack } = useSnack();

  /* Extract the relevant event data. */
  const {
    eventUuid: eventUuid,
    dateString: eventDate,
    timeString: eventTime,
    title: eventTitle,
    description: eventDescription,
    capacity: eventCapacity,
    visibility: eventVisibility,
    image: eventImage,
  } = eventData;

  /* check if the user has this event as a favorite */
  useEffect(() => {
    const getFavoriteStatus = async () => {
      if (user) {
        const favorite = await getUserFavorite(user.id, eventUuid);
        setFavorited(favorite !== null);
        setFavoriteFetched(true);
      }
    };

    const getRegisteredStatus = async () => {
      if (user) {
        const registration = await getUserRegistration(user.id, eventUuid);
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
  }, [eventUuid, user]);

  const registerForEvent = async () => {
    if (user) {
      const success = await registerUser(user.id, eventUuid, RegStatus.GOING);
      if (success) {
        addSnack("Meldt på arrangement", SnackTypes.SUCCESS);
        setRegistered(true);
      } else {
        addSnack("En feil skjedde under påmelding", SnackTypes.ERROR);
      }
      return success;
    }
    return false;
  };

  const unregisterForEvent = async () => {
    if (user) {
      const success = await deleteRegistrationUser(user.id, eventUuid);
      if (success) {
        addSnack("Meldt av arrangement", SnackTypes.SUCCESS);
        setRegistered(false);
      } else {
        addSnack("En feil skjedde under avmelding", SnackTypes.ERROR);
      }
      return success;
    }
    return false;
  };

  const imageHeight = windowWidth > 500 ? "30%" : "65%";

  return (
    <>
      <HeadComponent
        title={`Peoply - ${eventTitle}`}
        description={eventData.description}
        url={`${baseUrl}${router.asPath}`}
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
                    addFavorite(user.id, eventUuid);
                  } else {
                    removeFavorite(user.id, eventUuid);
                  }
                  setFavorited(!favorited);
                } else {
                  /* user is not logged in */
                  router.push("/login");
                }
              }
            }}
            favorited={favorited}
          />
          <Image
            src={placeholderImage}
            width="100%"
            height={imageHeight}
            layout="responsive"
            objectFit="cover"
            objectPosition="center top"
            priority
            alt="Nå er det fest!"
          />
        </div>
        <div className={styles.eventContainer}>
          <div className={styles.eventPriceTag}>Gratis</div>
          <div className={styles.eventInfoContainer}>
            <p className={styles.eventTags}>Fest, alkohol, kaffe</p>
            <h1 className={styles.marginBottomSmall}>{eventTitle}</h1>
            <div className={styles.eventInfoCard}>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <UserCircle />
                <p className={`${styles.infoText} ${styles.emphasis}`}>
                  Cybernetisk selskab
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
                    {eventDate}
                  </p>
                  <p className={styles.infoText}>{eventTime}</p>
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
                  <span className={styles.emphasis}>{eventCapacity}</span>{" "}
                  plasser ledig
                </p>
              </div>
            </div>
          </div>
          <div className={styles.descContainer}>
            <h2 className={styles.descHeader}>Informasjon</h2>
            <p className={styles.descText}>{eventDescription}</p>
          </div>
          {registered ? (
            <PrimaryButton
              text="Meld deg av arrangementet"
              className={`${styles.primaryButton} ${styles.dangerButton}`}
              onClick={() => {
                if (registeredFetched) {
                  if (user) {
                    unregisterForEvent();
                  } else {
                    /* User is not logged in. */
                    router.push("/login");
                  }
                }
              }}
            />
          ) : (
            <PrimaryButton
              text="Meld deg på arrangementet"
              className={styles.primaryButton}
              onClick={() => {
                if (registeredFetched) {
                  if (user) {
                    registerForEvent();
                  } else {
                    /* User is not logged in. */
                    router.push("/login");
                  }
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

  const eventData = await getEventData(eid);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!eventData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      baseUrl,
      eventData,
    },
    revalidate: 60,
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
