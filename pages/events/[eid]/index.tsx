// Next.js.
import Image from "next/image";
import { GetStaticProps } from "next";
import Link from "next/link";
import router from "next/router";

// React.
import { useEffect, useState } from "react";

// Components.
import UserCircle from "../../../components/UserCircle";
import DateCircle from "../../../components/DateCircle";
import PlaceCircle from "../../../components/PlaceCircle";
import SmallCheckCircle from "../../../components/SmallCheckCircle";
import Button, { IconPlacement } from "../../../components/Button";
import BackButtonGlass from "../../../components/BackButtonGlass";
import HeartIconGlass from "../../../components/HeartIconGlass";
import HeadComponent from "../../../components/HeadComponent";
import EditIconGlass from "../../../components/EditIconGlass";
import { ShareButton } from "../../../components/ShareButton";
import LinkButton from "../../../components/LinkButton";
import MailIcon from "../../../components/svgs/MailIcon";
import Modal from "../../../components/Modal";

// Hooks.
import useUser from "../../../hooks/useUser";
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSWR from "swr";

// Services.
import {
  addFavorite,
  getEventData,
  getTopXEvents,
  getUserFavorite,
  getUserRegistration,
  registerUser,
  removeFavorite,
  updateRegistrationUser,
} from "../../../services/events";

import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";

// Utils.
import { formatDateRange, formatTimeRange } from "../../../utils/functions";

// Types.
import {
  ButtonType,
  Event,
  InvitationStatus,
  OrganizationRole,
  Registration,
  RegStatus,
  SnackTypes,
} from "../../../types/types";

// Assets.
import placeholderImage from "../../../assets/images/undraw_partying.png";
import { ParsedUrlQuery } from "querystring";

// Styles.
import styles from "../../../styles/Event.module.scss";

interface EventProps {
  event: Event;
  baseUrl: string;
}

const Event = ({ event, baseUrl }: EventProps) => {
  const { user, loading: loadingUser, orgs } = useUser();
  const goBack = useBack();
  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database
  const [registrationStatus, setRegistrationStatus] = useState<RegStatus>();
  const [registeredFetched, setRegisteredFetched] = useState(false);
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();
  const [mapsUrl, setMapsUrl] = useState<string>();
  const [foodPreferenceModalOpen, setFoodPreferenceModalOpen] = useState(false);

  const { data: eventData, mutate: updateEvent } = useSWR<Event>(
    `/events/${event.urlId}`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: event,
    },
  );

  const { data: registrations, error: registrationsError } = useSWR<
    Registration[]
  >(
    () =>
      event?.id ? `/events/${event.id}/registrations?includeUsers=true` : false,
    fetchFromPeoplyApiJson,
  );

  /* check if the user has this event as a favorite */
  useEffect(() => {
    if (navigator && eventData?.freeformAddress) {
      const url = `https://maps.google.com?q=`;
      let query: string;
      if (eventData.poiName) {
        query = encodeURIComponent(
          `${eventData.poiName} ${eventData.freeformAddress}`,
        );
      } else {
        query = encodeURIComponent(eventData.freeformAddress);
      }
      setMapsUrl(url + query);
    }

    const getFavoriteStatus = async () => {
      if (user && eventData) {
        const favorite = await getUserFavorite(user.id, eventData.id);
        setFavorited(favorite !== null);
        setFavoriteFetched(true);
      } else if (!loadingUser && !user && eventData) {
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
        setRegistrationStatus(registration.regStatus);
      } else if (!loadingUser && !user && eventData) {
        setRegisteredFetched(true);
      }
    };

    getRegisteredStatus();
    getFavoriteStatus();
  }, [eventData, user, loadingUser]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  // Check if the event is open for registrations.
  const openForRegistrations = () => {
    const endDate = eventData.endDate && new Date(eventData.endDate);
    const now = new Date();

    if (endDate && now > endDate) {
      return false;
    }
    return true;
  };

  const addFavoriteFunc = async () => {
    if (user) {
      let success;
      if (!favorited) {
        success = await addFavorite(user.id, eventData.id);
        if (!success)
          addSnack("Klarte ikke å legge til favoritt", SnackTypes.ERROR);
      } else {
        success = await removeFavorite(user.id, eventData.id);
        if (!success)
          addSnack("Klarte ikke å fjerne favoritt", SnackTypes.ERROR);
      }

      if (await success) setFavorited(!favorited);
    } else {
      /* User is not logged in. */
      redirectToLogin();
    }
  };

  const registerForEvent = async () => {
    if (user) {
      if (openForRegistrations()) {
        /* force user to update food prefs if food is served */
        if (event.hasFood && !user.foodPreference) {
          return setFoodPreferenceModalOpen(true);
        }
        let newRegistration: Registration | undefined;
        try {
          newRegistration = await registerUser(
            user.id,
            eventData.id,
            RegStatus.GOING,
          );
        } catch (e) {
          newRegistration = undefined;
        }

        if (newRegistration) {
          setRegistrationStatus(newRegistration.regStatus);
          updateEvent();
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

  const editEventFunc = () => {
    router.push(router.asPath + "/edit");
  };

  const updateRegistrationStatus = async (status: RegStatus) => {
    if (user) {
      /* force user to update food prefs if food is served */
      if (status === RegStatus.GOING && event.hasFood && !user.foodPreference) {
        return setFoodPreferenceModalOpen(true);
      }
      let success = undefined;
      try {
        success = (await updateRegistrationUser(
          user.id,
          eventData.id,
          status,
        )) as Registration;
      } catch (e) {}
      if (success) {
        setRegistrationStatus(status);
        updateEvent();
        if (success.regStatus === RegStatus.GOING) {
          addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.WAITLISTED) {
          addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.NOT_GOING) {
          addSnack("Du er nå meldt av arrangementet", SnackTypes.SUCCESS);
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
    /* force user to update food prefs if food is served */
    if (event.hasFood && !user?.foodPreference) {
      return setFoodPreferenceModalOpen(true);
    }
    try {
      await fetchFromPeoplyApi(`/events/${eventData?.id}/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          status: InvitationStatus.ACCEPTED,
        }),
      });
      setRegistrationStatus(RegStatus.GOING);
      updateEvent();
      addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  }

  // Get the appropriate button for the current user's registration status and event date.
  const getButton = () => {
    if (!openForRegistrations()) {
      return (
        <Button
          text="Dette arrangementet er ferdig"
          className={`${styles.primaryButton} ${styles.dangerButton}`}
          loading={!registeredFetched}
          disabled
        />
      );
    }

    if (registrationStatus === RegStatus.GOING) {
      return (
        <Button
          type={ButtonType.DANGER}
          text="Meld deg av arrangementet"
          className={`${styles.primaryButton} ${styles.dangerButton}`}
          onClick={() => updateRegistrationStatus(RegStatus.NOT_GOING)}
          loading={!registeredFetched}
        />
      );
    } else if (!registrationStatus) {
      if (eventData?.registrations && eventData?.capacity) {
        if (
          eventData.registrations?.filter(
            (r) => r.regStatus === RegStatus.GOING,
          ).length < eventData?.capacity
        ) {
          return (
            <Button
              text="Meld deg på arrangementet"
              className={styles.primaryButton}
              onClick={registerForEvent}
              loading={!registeredFetched}
            />
          );
        } else {
          return (
            <Button
              type={ButtonType.WARNING}
              text="Meld deg på ventliste"
              className={styles.primaryButton}
              onClick={registerForEvent}
              loading={!registeredFetched}
            />
          );
        }
      } else if (eventData && eventData?.capacity === null) {
        return (
          <Button
            text="Meld deg på arrangementet"
            className={styles.primaryButton}
            onClick={registerForEvent}
            loading={!registeredFetched}
          />
        );
      }
    } else if (registrationStatus === RegStatus.WAITLISTED) {
      return (
        <Button
          type={ButtonType.DANGER}
          text="Avmeld deg fra venteliste"
          className={styles.primaryButton}
          onClick={() => updateRegistrationStatus(RegStatus.NOT_GOING)}
          loading={!registeredFetched}
        />
      );
    } else if (registrationStatus === RegStatus.NOT_GOING) {
      return (
        <Button
          text="Meld deg på arrangementet"
          className={styles.primaryButton}
          onClick={() => updateRegistrationStatus(RegStatus.GOING)}
          loading={!registeredFetched}
        />
      );
    } else if (registrationStatus === RegStatus.INVITED) {
      return (
        <Button
          text="Meld deg på arrangementet"
          className={styles.primaryButton}
          onClick={acceptInvitation}
          loading={!registeredFetched}
        />
      );
    }
  };

  const getArrangerImageOrIcon = () => {
    if (eventData.eventArrangers && eventData.eventArrangers.length > 0) {
      const firstArranger = eventData.eventArrangers[0].arranger;

      const imageSrc = firstArranger?.user
        ? firstArranger.user.image
        : firstArranger?.organization?.image;

      if (imageSrc) {
        return (
          <div className={styles.arrangerImage}>
            <Image
              src={imageSrc}
              alt="Arrangøren av arrangementet"
              layout="fill"
              objectFit="cover"
              sizes="5vw"
            />
          </div>
        );
      } else {
        return (
          <div className={styles.iconContainer}>
            <UserCircle />
          </div>
        );
      }
    }
  };

  const isArranger = () => {
    /* arrangerIds for orgs where the user is ownerOrAdmin */
    const organizationArrangerIdsForUser = orgs
      ?.map((org) => ({
        role: org.organizationRoles?.find((role) => role.userId === user?.id),
        arrangerId: org.arrangerId,
      }))
      ?.filter(
        ({ role }) =>
          role &&
          [OrganizationRole.ADMIN, OrganizationRole.OWNER].includes(role.role),
      )
      .map(({ arrangerId }) => arrangerId);

    const arrangersIdsForEvent = eventData?.eventArrangers?.map(
      (arranger) => arranger.arrangerId,
    );

    if (user && arrangersIdsForEvent?.includes(user.arrangerId)) {
      return true;
    } else if (
      organizationArrangerIdsForUser &&
      organizationArrangerIdsForUser.some((id) =>
        arrangersIdsForEvent?.includes(id),
      )
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
      <HeadComponent
        title={eventData.title}
        description={eventData.description}
        url={`${baseUrl}/events/${eventData.urlId}`}
        imageUrl={eventData.image}
      />

      <div className={styles.eventWrapper}>
        <div className={styles.imageWrapper}>
          <BackButtonGlass className={styles.backIcon} onClick={goBack} />
          <HeartIconGlass
            className={styles.favoriteIcon}
            onClick={addFavoriteFunc}
            favorited={favorited}
            loading={!favoriteFetched}
          />
          {isArranger() && (
            <EditIconGlass
              className={styles.editIcon}
              onClick={editEventFunc}
            />
          )}
          <div className={styles.imageContainer}>
            <Image
              src={eventData.image ?? placeholderImage}
              layout="fill"
              sizes="50vw"
              objectFit="cover"
              alt="Et bilde som passer til arrangementet"
              placeholder={!eventData.image ? "blur" : "empty"}
            />
          </div>
        </div>
        <div className={styles.eventContainer}>
          <div className={styles.eventCalendarTagWrapper}>
            <div className={styles.eventCalendarTag}>
              <span className={styles.date}>{`${eventData.startDate
                .toString()
                .substring(8, 10)}.`}</span>
              <span className={styles.eventCalendarTagFlair} />
            </div>
          </div>
          {/* <div className={styles.eventPriceTag}>Gratis</div> */}
          <div className={styles.eventInfoContainer}>
            <p className={styles.eventTags}>
              {eventData.eventCategories
                ?.map((cat) => cat.category.name)
                .join(" · ")}
            </p>
            <h1 className={styles.title}>{eventData.title}</h1>
            <div className={styles.eventInfoCard}>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                {getArrangerImageOrIcon()}
                <p className={`${styles.infoText} ${styles.emphasis}`}>
                  {eventData.eventArrangers?.map((a) => {
                    if (a.arranger.user) {
                      return (
                        <Link
                          key={a.arranger.id}
                          href={`/users/${a.arranger.user.id}`}
                        >
                          {a.arranger.user.firstName +
                            " " +
                            a.arranger.user.lastName}
                        </Link>
                      );
                    } else if (a.arranger.organization) {
                      return (
                        <Link
                          key={a.arranger.id}
                          href={`/orgs/${a.arranger.organization.id}`}
                        >
                          {a.arranger.organization?.name}
                        </Link>
                      );
                    }
                  })}
                </p>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <div className={styles.iconContainer}>
                  <DateCircle />
                </div>
                <div>
                  <p
                    className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                  >
                    {formatDateRange(
                      new Date(eventData.startDate),
                      eventData.endDate !== null
                        ? new Date(eventData.endDate)
                        : null,
                    )}
                  </p>
                  <p className={styles.infoText}>
                    {formatTimeRange(
                      new Date(eventData.startDate),
                      eventData.endDate !== null
                        ? new Date(eventData.endDate)
                        : null,
                    )}
                  </p>
                </div>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomMedium}`}
              >
                {eventData.freeformAddress ? (
                  <a
                    className={styles.row}
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className={styles.iconContainer}>
                      <PlaceCircle />
                    </div>
                    <div>
                      <p
                        className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                      >
                        {eventData.locationName}
                      </p>
                      {eventData.freeformAddress && (
                        <p
                          className={`${styles.infoText} ${styles.primaryColor}`}
                        >
                          {eventData.freeformAddress}
                        </p>
                      )}
                    </div>
                  </a>
                ) : (
                  <>
                    <div className={styles.iconContainer}>
                      <PlaceCircle />
                    </div>

                    <div>
                      <p
                        className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                      >
                        {eventData.locationName}
                      </p>
                    </div>
                  </>
                )}
              </div>
              {registrations && (
                <Link href={`/events/${eventData.urlId}/participants`} passHref>
                  <a>
                    <div
                      className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
                    >
                      <div className={styles.iconContainer}>
                        <SmallCheckCircle />
                      </div>
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
                  </a>
                </Link>
              )}
              {(registrationsError || !registrations) && (
                <div
                  className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
                >
                  <div className={styles.iconContainer}>
                    <SmallCheckCircle />
                  </div>
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
              )}
            </div>
          </div>
          <div className={styles.descWrapper}>
            <div className={styles.descHeaderWrapper}>
              <div className={styles.shareButtons}>
                <ShareButton
                  buttonText="Del arrangement"
                  shareUrl={`${process.env.NEXT_PUBLIC_BASE_URL}/events/${eventData.urlId}`}
                  shareTitle={eventData.title}
                  iconPlacement={IconPlacement.ABOVE_ON_MOBILE}
                />
                <LinkButton
                  href={`/events/${eventData.urlId}/invite`}
                  small
                  text="Inviter brukere"
                  type={ButtonType.SECONDARY}
                  icon={<MailIcon />}
                  iconPlacement={IconPlacement.ABOVE_ON_MOBILE}
                />
              </div>
              <h2 className={styles.descHeader}>Informasjon</h2>
            </div>
            <div className={styles.descriptionContainer}>
              {eventData.description.split("\n").map((str) => (
                <p key={str} className={styles.descText}>
                  {str}
                  <br></br>
                </p>
              ))}
            </div>
          </div>
          {getButton()}
        </div>
      </div>
      {foodPreferenceModalOpen && (
        <Modal
          label={`Arrangementet har matservering`}
          description="For å melde deg på arrangementet må du fylle ut matpreferanser på profilen din."
          buttonText={`Rediger matpreferanser`}
          secondaryButtonText="Lukk"
          buttonOnClick={() => router.push("/me/edit")}
          secondaryButtonOnClick={() => setFoodPreferenceModalOpen(false)}
          closeButtonOnclick={() => setFoodPreferenceModalOpen(false)}
        />
      )}
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
