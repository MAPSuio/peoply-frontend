// Next.js.
import Image from "next/image";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import router from "next/router";

// React.
import { useEffect, useState } from "react";

// Components.
import UserCircle from "../../../components/UserCircle";
import DateCircle from "../../../components/DateCircle";
import PlaceCircle from "../../../components/PlaceCircle";
import SmallCheckCircle from "../../../components/SmallCheckCircle";
import FoodCircle from "../../../components/svgs/FoodCircle";
import { IconPlacement } from "../../../components/Button";
import BackButtonGlass from "../../../components/BackButtonGlass";
import HeartIconGlass from "../../../components/HeartIconGlass";
import HeadComponent from "../../../components/HeadComponent";
import EditIconGlass from "../../../components/EditIconGlass";
import AddToCalendarButton from "../../../components/AddToCalendarButton";
import { ShareButton } from "../../../components/ShareButton";
import LinkButton from "../../../components/LinkButton";
import MailIcon from "../../../components/svgs/MailIcon";
import LinkIcon from "../../../components/svgs/LinkIcon";

// Hooks.
import useUser from "../../../hooks/useUser";
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSWR from "swr";

// Services.
import {
  addFavorite,
  getUserFavorite,
  removeFavorite,
} from "../../../services/events";

import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Utils.
import {
  formatDateRange,
  formatTimeRange,
  injectLink,
} from "../../../utils/functions";
import { getEventArrangerDisplayItems } from "../../../utils/eventArrangers";

// Types.
import {
  ButtonType,
  Event,
  EventRegistrationMode,
  EventUpdate,
  OrganizationRole,
  Registration,
  RegStatus,
  SnackTypes,
  Visibility,
} from "../../../types/types";

// Assets.
import placeholderImage from "../../../assets/images/undraw_partying.png";
import { ParsedUrlQuery } from "querystring";

// Styles.
import styles from "../../../styles/Event.module.scss";
import JoinButton from "../../../components/JoinButton";
import RSSIcon from "../../../components/svgs/RSSIcon";
import EventUpdateCard from "../../../components/EventUpdateCard";

interface EventProps {
  event: Event;
  baseUrl: string;
}

const Event = ({ event, baseUrl }: EventProps) => {
  const { user, loading: loadingUser, orgs } = useUser();
  const goBack = useBack();
  const [favorited, setFavorited] = useState(false);
  const [favoriteFetched, setFavoriteFetched] = useState(false); // used to disable button until we get a response from the database
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();
  const [mapsUrl, setMapsUrl] = useState<string>();

  const { data: eventData, mutate: updateEvent } = useSWR<Event>(
    `/events/${event.urlId}`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: event,
    },
  );

  const { data: registrations, error: registrationsError } = useSWR<
    Registration[]
  >(() =>
    event?.id ? `/events/${event.id}/registrations?includeUsers=true` : false,
  );

  const {
    data: updates,
    error: updatesError,
    mutate: mutateUpdates,
  } = useSWR<EventUpdate[]>(() =>
    event?.id ? `/events/${event.id}/updates` : false,
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

    getFavoriteStatus();
  }, [eventData, user, loadingUser]);

  if (!eventData) {
    return <div>Loading...</div>;
  }

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

  const editEventFunc = () => {
    router.push(`/events/${eventData.urlId}/edit`);
  };

  const eventArrangerDisplayItems = getEventArrangerDisplayItems(eventData);

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
              fill
              sizes="5vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        );
      } else {
        return (
          <div className={styles.iconContainer}>
            <UserCircle className={styles.icon} />
          </div>
        );
      }
    }
  };

  const isArranger = (() => {
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
  })();

  return (
    <>
      <HeadComponent
        title={eventData.title}
        description={eventData.description}
        url={`${baseUrl}/events/${eventData.urlId}`}
        imageUrl={eventData.image}
        noIndex={
          eventData.visibility === Visibility.UNLISTED ||
          eventData.visibility === Visibility.PRIVATE
        }
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
          {isArranger && !eventData.readOnly && (
            <EditIconGlass
              className={styles.editIcon}
              onClick={editEventFunc}
            />
          )}
          <div className={styles.imageContainer}>
            <Image
              src={eventData.image ?? placeholderImage}
              fill
              sizes="50vw"
              style={{ objectFit: "cover" }}
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
              <div className={styles.eventCalendarTagFlair}>
                <span className={styles.month}>
                  {`${new Date(eventData.startDate)
                    .toDateString()
                    .substring(4, 7)}`}
                </span>
              </div>
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
                  {eventArrangerDisplayItems.map((arranger, index) => (
                    <span key={arranger.id} className={styles.arrangerLinkRow}>
                      {index > 0 && (
                        <span className={styles.arrangerSeparator}> · </span>
                      )}
                      <Link
                        href={arranger.href}
                        className={styles.arrangerLink}
                      >
                        <span className={styles.orgLink}>
                          {arranger.label}
                          {arranger.isVerifiedOrganization && (
                            <SmallCheckCircle purple verySmall />
                          )}
                        </span>
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
              <div
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                <div className={styles.iconContainer}>
                  <DateCircle className={styles.icon} />
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
                className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
              >
                {eventData.freeformAddress ? (
                  <a
                    className={styles.row}
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className={styles.iconContainer}>
                      <PlaceCircle className={styles.icon} />
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
                      <PlaceCircle className={styles.icon} />
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
              {eventData.hasFood && (
                <div
                  className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
                >
                  {" "}
                  <div className={styles.iconContainer}>
                    <FoodCircle />
                  </div>
                  <div>
                    <p
                      className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
                    >
                      Matservering
                    </p>
                  </div>
                </div>
              )}
              {registrations && (
                <Link href={`/events/${eventData.urlId}/participants`}>
                  <div className={`${styles.infoTextContainer}`}>
                    <div className={styles.iconContainer}>
                      <SmallCheckCircle
                        className={`${styles.icon} ${styles.checkIcon}`}
                      />
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
                </Link>
              )}
              {(registrationsError || !registrations) && (
                <div
                  className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
                >
                  <div className={styles.iconContainer}>
                    <SmallCheckCircle
                      className={`${styles.icon} ${styles.checkIcon}`}
                    />
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
                <AddToCalendarButton
                  event={eventData}
                  buttonText="Legg i kalender"
                  iconPlacement={IconPlacement.ABOVE_ON_MOBILE}
                />
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
                  noShadow
                />
                {isArranger && (
                  <LinkButton
                    href={`/events/${eventData.urlId}/update`}
                    small
                    text="Lag oppdatering"
                    type={ButtonType.SECONDARY}
                    icon={<RSSIcon />}
                    iconPlacement={IconPlacement.ABOVE_ON_MOBILE}
                    noShadow
                  />
                )}
              </div>
              <h2 className={styles.descHeader}>Informasjon</h2>
            </div>
            <div className={styles.descriptionContainer}>
              {eventData.description.split("\n").map((str) => (
                <p key={str} className={styles.descText}>
                  {injectLink(str)}
                  <br></br>
                </p>
              ))}
            </div>
          </div>
          {updates && updates.length > 0 && (
            <div className={styles.announcementsWrapper}>
              <h2 className={styles.announcementsHeader}>Oppdateringer</h2>
              <div className={styles.announcementCards}>
                {updates?.map((update) => (
                  <EventUpdateCard
                    key={update.id}
                    update={update}
                    isArranger={isArranger}
                    mutateUpdates={mutateUpdates}
                  />
                ))}
              </div>
            </div>
          )}
          {eventData.registrationMode === EventRegistrationMode.EXTERNAL &&
          eventData.externalUrl ? (
            <LinkButton
              text="Gå til ekstern påmelding"
              href={eventData.externalUrl}
              className={styles.primaryButton}
              type={ButtonType.PRIMARY}
              icon={<LinkIcon />}
              iconPlacement={IconPlacement.LEFT}
              target="_blank"
              rel="noopener noreferrer"
            />
          ) : eventData.registrationMode === EventRegistrationMode.NONE ? (
            <p className={styles.noRegistrationText}>
              Påmelding håndteres ikke i Peoply for dette arrangementet.
            </p>
          ) : (
            <JoinButton
              event={eventData}
              updateOnChange={[updateEvent, mutateUpdates]}
              className={styles.primaryButton}
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

function readSetCookieHeaders(headers: Headers) {
  const headersWithSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithSetCookie.getSetCookie === "function") {
    return headersWithSetCookie.getSetCookie();
  }

  // `headers.get("set-cookie")` may collapse multiple cookies into one string.
  // Prefer `getSetCookie()` when the runtime provides it.
  const setCookieHeader = headers.get("set-cookie");

  if (setCookieHeader) {
    console.warn(
      "Falling back to headers.get('set-cookie'); multiple cookies may be combined:",
      setCookieHeader,
    );
  }

  return setCookieHeader ? [setCookieHeader] : [];
}

function applySetCookiesToHeader(
  cookieHeader: string,
  setCookieHeaders: string[],
) {
  const cookies = new Map<string, string>();

  cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      const separatorIndex = entry.indexOf("=");

      if (separatorIndex === -1) {
        return;
      }

      cookies.set(
        entry.slice(0, separatorIndex),
        entry.slice(separatorIndex + 1),
      );
    });

  setCookieHeaders.forEach((header) => {
    const [cookiePair] = header.split(";");
    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    cookies.set(
      cookiePair.slice(0, separatorIndex),
      cookiePair.slice(separatorIndex + 1),
    );
  });

  return Array.from(cookies.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
}

async function fetchEventForRequest(
  eid: string,
  cookieHeader: string | undefined,
  baseApiUrl: string,
  res: GetServerSidePropsContext["res"],
) {
  const eventUrl = `${baseApiUrl}/events/${eid.toUpperCase()}`;

  const requestHeaders = cookieHeader ? { cookie: cookieHeader } : undefined;
  let eventResponse = await fetch(eventUrl, {
    headers: requestHeaders,
  });

  if (!cookieHeader || eventResponse.ok || eventResponse.status !== 404) {
    return eventResponse;
  }

  const refreshResponse = await fetch(`${baseApiUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!refreshResponse.ok) {
    return eventResponse;
  }

  const setCookieHeaders = readSetCookieHeaders(refreshResponse.headers);

  if (setCookieHeaders.length === 0) {
    return eventResponse;
  }

  res.setHeader("set-cookie", setCookieHeaders);

  eventResponse = await fetch(eventUrl, {
    headers: {
      cookie: applySetCookiesToHeader(cookieHeader, setCookieHeaders),
    },
  });

  return eventResponse;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { eid } = context.params as IParams;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const baseApiUrl =
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  try {
    if (!baseApiUrl) {
      throw new Error("Missing API base URL");
    }

    if (!baseUrl) {
      throw new Error("Missing NEXT_PUBLIC_BASE_URL");
    }

    const eventResponse = await fetchEventForRequest(
      eid,
      context.req.headers.cookie,
      baseApiUrl,
      context.res,
    );

    if (eventResponse.status === 404) {
      return {
        notFound: true,
      };
    }

    if (!eventResponse.ok) {
      throw new Error(`Failed to fetch event ${eid}: ${eventResponse.status}`);
    }

    const event: Event = await eventResponse.json();

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
    };
  } catch (error) {
    console.error(`Failed to fetch event ${eid}:`, error);
    return {
      notFound: true,
    };
  }
};

export default Event;
