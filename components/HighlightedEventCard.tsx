// Next.js.
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// React.
import { useEffect, useState } from "react";

// Components.
import Avatar from "./Avatar";
import CalendarIconCard from "./svgs/CalendarIconCard";
import Button from "./Button";
import Modal from "./Modal";
import HeartIconGlass from "./HeartIconGlass";

// Hooks.
import useUser from "../hooks/useUser";
import useSnack from "../hooks/useSnack";
import useRedirectToLogin from "../hooks/useRedirectToLogin";

// Services.
import { formatDateRange, formatTimeRange } from "../utils/functions";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import {
  addFavorite,
  getUserFavorite,
  getUserRegistration,
  registerUser,
  removeFavorite,
  updateRegistrationUser,
} from "../services/events";

// Types.
import {
  ButtonType,
  Event,
  InvitationStatus,
  Registration,
  RegStatus,
  SnackTypes,
} from "../types/types";

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
  const router = useRouter();

  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database
  const [registrationStatus, setRegistrationStatus] = useState<RegStatus>();
  const [registeredFetched, setRegisteredFetched] = useState(false);
  const [unregisterModalOpen, setUnregisterModalOpen] = useState(false);
  const [foodPreferenceModalOpen, setFoodPreferenceModalOpen] = useState(false);

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

    const getRegisteredStatus = async () => {
      if (user && event) {
        const registration = await getUserRegistration(user.id, event.id);
        setRegisteredFetched(true);

        if (registration === null) {
          return;
        }
        setRegistrationStatus(registration.regStatus);
      } else if (!loadingUser && !user && event) {
        setRegisteredFetched(true);
      }
    };

    getRegisteredStatus();
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

  // Check if the event is open for registrations.
  const openForRegistrations = () => {
    const endDate = event.endDate && new Date(event.endDate);
    const now = new Date();

    if (endDate && now > endDate) {
      return false;
    }
    return true;
  };

  const registerForEvent = async (ev: MouseEvent) => {
    ev.preventDefault();
    if (user) {
      if (openForRegistrations()) {
        if (event.hasFood && !user.foodPreference) {
          return setFoodPreferenceModalOpen(true);
        }

        let newRegistration: Registration | undefined;
        try {
          newRegistration = await registerUser(
            user.id,
            event.id,
            RegStatus.GOING,
          );
        } catch (error) {
          newRegistration = undefined;
        }

        if (newRegistration) {
          setRegistrationStatus(newRegistration.regStatus);
          updateRegistrations();
          if (newRegistration.regStatus === RegStatus.GOING) {
            addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
          } else if (newRegistration.regStatus === RegStatus.WAITLISTED) {
            addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
          }
        } else {
          addSnack("En feil skjedde under påmelding", SnackTypes.ERROR);
        }
        return newRegistration;
      } else {
        addSnack("Dette arrangementet er ferdig.", SnackTypes.ERROR);
      }
    } else {
      redirectToLogin();
    }
  };

  const updateRegistrationStatus = async (
    status: RegStatus,
    ev?: MouseEvent,
  ) => {
    if (ev) {
      ev.preventDefault();
    }

    if (user) {
      if (status === RegStatus.GOING && event.hasFood && !user.foodPreference) {
        return setFoodPreferenceModalOpen(true);
      }
      let success = undefined;
      try {
        success = (await updateRegistrationUser(
          user.id,
          event.id,
          status,
        )) as Registration;
      } catch (error) {}
      if (success) {
        setRegistrationStatus(status);
        updateRegistrations();
        if (success.regStatus === RegStatus.GOING) {
          addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.WAITLISTED) {
          addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.NOT_GOING) {
          addSnack("Du er nå meldt av arrangementet");
        }
      } else {
        addSnack("En feil skjedde under oppdatering", SnackTypes.ERROR);
      }
      return success;
    } else {
      redirectToLogin();
    }
  };

  async function acceptInvitation() {
    if (event.hasFood && !user?.foodPreference) {
      return setFoodPreferenceModalOpen(true);
    }
    try {
      await fetchFromPeoplyApi(`/events/${event.id}/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          status: InvitationStatus.ACCEPTED,
        }),
      });
      setRegistrationStatus(RegStatus.GOING);
      updateRegistrations();
      addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
    } catch (error) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  }

  const getButton = () => {
    if (registrationStatus === RegStatus.GOING) {
      return (
        <Button
          type={ButtonType.REGISTERED}
          text="Du er påmeldt"
          loading={!registeredFetched}
          small
          noShadow
          onClick={(e) => {
            e.preventDefault();
            setUnregisterModalOpen(true);
          }}
          className={styles.primaryButton}
        />
      );
    } else if (!openForRegistrations()) {
      return (
        <Button
          text="Ferdig"
          loading={!registeredFetched}
          small
          noShadow
          disabled
          className={styles.primaryButton}
        />
      );
    } else if (!registrationStatus) {
      if (registrations && event.capacity) {
        if (registrations < event.capacity) {
          return (
            <Button
              type={ButtonType.PRIMARY}
              text="Meld deg på"
              onClick={registerForEvent}
              loading={!registeredFetched}
              small
              noShadow
              className={styles.primaryButton}
            />
          );
        } else {
          return (
            <Button
              type={ButtonType.WARNING}
              text="Meld deg på venteliste"
              onClick={registerForEvent}
              loading={!registeredFetched}
              small
              noShadow
              className={styles.primaryButton}
            />
          );
        }
      } else if (event.capacity === null) {
        return (
          <Button
            type={ButtonType.PRIMARY}
            text="Meld deg på"
            onClick={registerForEvent}
            loading={!registeredFetched}
            small
            noShadow
            className={styles.primaryButton}
          />
        );
      }
    } else if (registrationStatus === RegStatus.WAITLISTED) {
      return (
        <Button
          type={ButtonType.DANGER}
          text="Meld deg av venteliste"
          onClick={(ev: MouseEvent) =>
            updateRegistrationStatus(RegStatus.NOT_GOING, ev)
          }
          loading={!registeredFetched}
          small
          noShadow
          className={styles.primaryButton}
        />
      );
    } else if (registrationStatus === RegStatus.NOT_GOING) {
      return (
        <Button
          type={ButtonType.PRIMARY}
          text="Meld deg på"
          onClick={(ev: MouseEvent) =>
            updateRegistrationStatus(RegStatus.GOING, ev)
          }
          loading={!registeredFetched}
          small
          noShadow
          className={styles.primaryButton}
        />
      );
    } else if (registrationStatus === RegStatus.INVITED) {
      return (
        <Button
          type={ButtonType.PRIMARY}
          text="Meld deg på"
          onClick={acceptInvitation}
          loading={!registeredFetched}
          small
          noShadow
          className={styles.primaryButton}
        />
      );
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
      {unregisterModalOpen && (
        <Modal
          label="Meld deg av arrangementet"
          description={`Er du sikker på at du vil melde deg av ${event.title}?`}
          buttonText="Meld deg av"
          secondaryButtonText="Forbli påmeldt"
          danger
          buttonOnClick={() => {
            updateRegistrationStatus(RegStatus.NOT_GOING);
            setUnregisterModalOpen(false);
          }}
          secondaryButtonOnClick={() => setUnregisterModalOpen(false)}
          closeButtonOnClick={() => setUnregisterModalOpen(false)}
        />
      )}
      {foodPreferenceModalOpen && (
        <Modal
          label={`Arrangementet har matservering`}
          description="For å melde deg på arrangementet må du fylle ut matpreferanser på profilen din."
          buttonText={`Rediger matpreferanser`}
          secondaryButtonText="Lukk"
          buttonOnClick={() => router.push("/me/edit")}
          secondaryButtonOnClick={() => setFoodPreferenceModalOpen(false)}
          closeButtonOnClick={() => setFoodPreferenceModalOpen(false)}
        />
      )}
      <Link
        href={
          arranger?.org
            ? `/orgs/${arranger?.org.id}`
            : `/users/${arranger?.user?.id}`
        }
      >
        <a>
          <div className={styles.headingAndAvatarContainer}>
            {arranger?.markup}
          </div>
        </a>
      </Link>
      <Link href={`/events/${event.id}`}>
        <a>
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
              {getButton()}
            </div>
          </div>
        </a>
      </Link>
    </div>
  );
};

export default HighlightedEventCard;
