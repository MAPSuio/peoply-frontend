// Next.js.
import Image from "next/image";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "../../../components/Link";
import router from "next/router";

// React.
import { useEffect, useState } from "react";

// Components.
import UserCircle from "../../../components/UserCircle";
import ArrangerAvatar from "../../../components/ArrangerAvatar";
import DateCircle from "../../../components/DateCircle";
import PlaceCircle from "../../../components/PlaceCircle";
import RegistrationCount from "../../../components/RegistrationCount";
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
import CoOrganizerInvitationBanner from "../../../components/CoOrganizerInvitationBanner";

// Hooks.
import useUser from "../../../hooks/useUser";
import useBack from "../../../hooks/useBack";
import useEventFavorite from "../../../hooks/useEventFavorite";
import useSWR from "swr";

// Services.
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Utils.
import { formatDateRange, formatTimeRange } from "../../../utils/functions";
import { getEventArrangerDisplayItems } from "../../../utils/eventArrangers";
import {
  getEventImage,
  getSafeExternalUrl,
  showsRegistrationCount,
} from "../../../utils/event";
import { isValidEventId } from "../../../utils/eventId";

// Types.
import {
  ButtonType,
  /* Type-only: the component below is also called `Event`, so without this a
     per-file transpiler cannot tell whether the import is a value that the
     local declaration collides with, or a type that vanishes at compile time. */
  type Event,
  EventRegistrationMode,
  type EventUpdate,
  OrganizationRole,
  type Registration,
  RegStatus,
  Visibility,
} from "../../../types/types";

// Assets.
import placeholderImage from "../../../assets/images/undraw_partying.png";
import type { ParsedUrlQuery } from "node:querystring";

// Styles.
import styles from "../../../styles/Event.module.scss";
import JoinButton from "../../../components/JoinButton";
import RSSIcon from "../../../components/svgs/RSSIcon";
import EventUpdateCard from "../../../components/EventUpdateCard";
import DescriptionText from "../../../components/DescriptionText";

import { BASE_URL } from "../../../constants/urls";

interface EventProps {
  event: Event;
}

/* The icon belongs to the row, not to the page: hiding only the text would
   leave a bare check mark behind on events that have no count to show. */
const GoingCountRow = ({
  goingCount,
  eventData,
  className,
}: {
  goingCount: number | undefined;
  eventData: Event;
  className?: string;
}) => (
  <div className={`${styles.infoTextContainer} ${className ?? ""}`}>
    <div className={styles.iconContainer}>
      <SmallCheckCircle className={`${styles.icon} ${styles.checkIcon}`} />
    </div>
    <p className={styles.infoText}>
      <span className={styles.emphasis}>{`${goingCount}${
        eventData.capacity ? `/${eventData.capacity}` : ""
      }`}</span>{" "}
      påmeldte
    </p>
  </div>
);

/* Links to the participant list when the caller could read it - arrangers get
   the registrations, everyone else (or a failed read) gets the bare row.
   External events show neither: the number is not ours to state, so nothing
   here renders at all. */
const GoingCountSection = ({
  goingCount,
  eventData,
  registrations,
}: {
  goingCount: number | undefined;
  eventData: Event;
  registrations: Registration[] | undefined;
}) => (
  <RegistrationCount event={eventData}>
    {registrations ? (
      <Link href={`/events/${eventData.urlId}/participants`}>
        <GoingCountRow goingCount={goingCount} eventData={eventData} />
      </Link>
    ) : (
      <GoingCountRow
        goingCount={goingCount}
        eventData={eventData}
        className={styles.marginBottomSmall}
      />
    )}
  </RegistrationCount>
);

/* Header image with the controls that float on top of it. The edit pencil is
   for arrangers, and never for an event mirrored from an .ics feed. */
const EventHero = ({
  eventData,
  eventImage,
  isArranger,
  goBack,
  favorited,
  favoriteLoading,
  toggleFavorite,
}: {
  eventData: Event;
  eventImage: string | undefined;
  isArranger: boolean;
  goBack: () => void;
  favorited: boolean;
  favoriteLoading: boolean;
  toggleFavorite: () => void;
}) => (
  <div className={styles.imageWrapper}>
    <BackButtonGlass className={styles.backIcon} onClick={goBack} />
    <HeartIconGlass
      className={styles.favoriteIcon}
      onClick={toggleFavorite}
      favorited={favorited}
      loading={favoriteLoading}
    />
    {isArranger && !eventData.readOnly && (
      <EditIconGlass
        className={styles.editIcon}
        onClick={() => router.push(`/events/${eventData.urlId}/edit`)}
      />
    )}
    <div className={styles.imageContainer}>
      <Image
        src={eventImage ?? placeholderImage}
        fill
        sizes="50vw"
        style={{ objectFit: "cover" }}
        alt="Et bilde som passer til arrangementet"
        /* "blur" needs a blurDataURL, which only the bundled placeholder
           has - a remote URL here would throw. */
        placeholder={eventImage ? "empty" : "blur"}
      />
    </div>
  </div>
);

const ArrangerLine = ({ eventData }: { eventData: Event }) => (
  <div className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}>
    <ArrangerAvatar
      event={eventData}
      classNames={{
        image: styles.arrangerImage,
        iconContainer: styles.iconContainer,
        icon: styles.icon,
      }}
      fallbackIcon={<UserCircle className={styles.icon} />}
      hideWhenNoArranger
    />
    <p className={`${styles.infoText} ${styles.emphasis}`}>
      {getEventArrangerDisplayItems(eventData).map((arranger, index) => (
        <span key={arranger.id} className={styles.arrangerLinkRow}>
          {index > 0 && <span className={styles.arrangerSeparator}> · </span>}
          <Link href={arranger.href} className={styles.arrangerLink}>
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
);

const DateTimeRow = ({ eventData }: { eventData: Event }) => {
  const startDate = new Date(eventData.startDate);
  const endDate =
    eventData.endDate !== null ? new Date(eventData.endDate) : null;

  return (
    <div className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}>
      <div className={styles.iconContainer}>
        <DateCircle className={styles.icon} />
      </div>
      <div>
        <p
          className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
        >
          {formatDateRange(startDate, endDate)}
        </p>
        <p className={styles.infoText}>{formatTimeRange(startDate, endDate)}</p>
      </div>
    </div>
  );
};

/* With an address the row links out to Maps; without one it is the same row
   without the anchor. */
const LocationRow = ({
  eventData,
  mapsUrl,
}: {
  eventData: Event;
  mapsUrl: string | undefined;
}) => {
  const name = (
    <p
      className={`${styles.infoText} ${styles.emphasis} ${styles.marginBottomMini}`}
    >
      {eventData.locationName}
    </p>
  );
  const icon = (
    <div className={styles.iconContainer}>
      <PlaceCircle className={styles.icon} />
    </div>
  );

  if (!eventData.freeformAddress) {
    return (
      <div
        className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}
      >
        {icon}
        <div>{name}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}>
      <a className={styles.row} href={mapsUrl} target="_blank" rel="noreferrer">
        {icon}
        <div>
          {name}
          <p className={`${styles.infoText} ${styles.primaryColor}`}>
            {eventData.freeformAddress}
          </p>
        </div>
      </a>
    </div>
  );
};

const FoodRow = ({ eventData }: { eventData: Event }) => {
  if (!eventData.hasFood) {
    return null;
  }

  return (
    <div className={`${styles.infoTextContainer} ${styles.marginBottomSmall}`}>
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
  );
};

const ShareButtons = ({
  eventData,
  isArranger,
}: {
  eventData: Event;
  isArranger: boolean;
}) => (
  <div className={styles.shareButtons}>
    <AddToCalendarButton
      event={eventData}
      buttonText="Legg i kalender"
      iconPlacement={IconPlacement.ABOVE_ON_MOBILE}
    />
    <ShareButton
      buttonText="Del arrangement"
      shareUrl={`${BASE_URL}/events/${eventData.urlId}`}
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
);

const UpdatesSection = ({
  updates,
  isArranger,
  mutateUpdates,
}: {
  updates: EventUpdate[] | undefined;
  isArranger: boolean;
  mutateUpdates: () => void;
}) => {
  if (!updates?.length) {
    return null;
  }

  return (
    <div className={styles.announcementsWrapper}>
      <h2 className={styles.announcementsHeader}>Oppdateringer</h2>
      <div className={styles.announcementCards}>
        {updates.map((update) => (
          <EventUpdateCard
            key={update.id}
            update={update}
            isArranger={isArranger}
            mutateUpdates={mutateUpdates}
          />
        ))}
      </div>
    </div>
  );
};

/* Registration either happens elsewhere, nowhere, or here. */
const RegistrationAction = ({
  eventData,
  updateEvent,
  mutateUpdates,
}: {
  eventData: Event;
  updateEvent: () => void;
  mutateUpdates: () => void;
}) => {
  const safeExternalUrl = getSafeExternalUrl(eventData);

  if (
    eventData.registrationMode === EventRegistrationMode.EXTERNAL &&
    safeExternalUrl
  ) {
    return (
      <LinkButton
        text="Gå til ekstern påmelding"
        href={safeExternalUrl}
        className={styles.primaryButton}
        type={ButtonType.PRIMARY}
        icon={<LinkIcon />}
        iconPlacement={IconPlacement.LEFT}
        target="_blank"
        rel="noopener noreferrer"
      />
    );
  }

  if (eventData.registrationMode === EventRegistrationMode.NONE) {
    return (
      <p className={styles.noRegistrationText}>
        Påmelding håndteres ikke i Peoply for dette arrangementet.
      </p>
    );
  }

  return (
    <JoinButton
      event={eventData}
      updateOnChange={[updateEvent, mutateUpdates]}
      className={styles.primaryButton}
    />
  );
};

/* True when the viewer arranges this event in their own name, or is admin or
   owner of an organization that does. */
const isUserArranger = (
  eventData: Event,
  user: ReturnType<typeof useUser>["user"],
  orgs: ReturnType<typeof useUser>["orgs"],
) => {
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
  }

  return !!organizationArrangerIdsForUser?.some((id) =>
    arrangersIdsForEvent?.includes(id),
  );
};

/* Google Maps link for the event's address, rebuilt whenever the address
   changes. Kept out of render because it reads `navigator`. */
const useMapsUrl = (eventData: Event | undefined) => {
  const [mapsUrl, setMapsUrl] = useState<string>();

  useEffect(() => {
    if (navigator && eventData?.freeformAddress) {
      const url = `https://maps.google.com?q=`;
      const query = eventData.poiName
        ? encodeURIComponent(
            `${eventData.poiName} ${eventData.freeformAddress}`,
          )
        : encodeURIComponent(eventData.freeformAddress);
      setMapsUrl(url + query);
    }
  }, [eventData]);

  return mapsUrl;
};

const Event = ({ event }: EventProps) => {
  const { user, orgs } = useUser();
  const goBack = useBack();
  const {
    favorited,
    loading: favoriteLoading,
    toggleFavorite,
  } = useEventFavorite(event.id);

  const { data: eventData, mutate: updateEvent } = useSWR<Event>(
    `/events/${event.urlId}`,
    fetchFromPeoplyApiJson,
    {
      fallbackData: event,
    },
  );

  /* Counted by the database. The registrations fallback only covers a client
     that loaded before the backend started sending goingCount. */
  const goingCount =
    eventData?.goingCount ??
    eventData?.registrations?.filter((r) => r.regStatus === RegStatus.GOING)
      .length;

  /* Only the count row reads this, and that row is gone on external events -
     so the request goes with it rather than pulling down a list nothing shows. */
  const { data: registrations } = useSWR<Registration[]>(() =>
    event?.id && showsRegistrationCount(eventData)
      ? `/events/${event.id}/registrations?includeUsers=true`
      : false,
  );

  const { data: updates, mutate: mutateUpdates } = useSWR<EventUpdate[]>(() =>
    event?.id ? `/events/${event.id}/updates` : false,
  );

  const mapsUrl = useMapsUrl(eventData);

  if (!eventData) {
    return <div>Loading...</div>;
  }

  const isArranger = isUserArranger(eventData, user, orgs);

  const eventImage = getEventImage(eventData);

  return (
    <>
      <HeadComponent
        title={eventData.title}
        description={eventData.description}
        path={`/events/${eventData.urlId}`}
        imageUrl={eventImage}
        noIndex={
          eventData.visibility === Visibility.UNLISTED ||
          eventData.visibility === Visibility.PRIVATE
        }
      />
      <div className={styles.eventWrapper}>
        <EventHero
          eventData={eventData}
          eventImage={eventImage}
          isArranger={isArranger}
          goBack={goBack}
          favorited={favorited}
          favoriteLoading={favoriteLoading}
          toggleFavorite={toggleFavorite}
        />
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
          <div className={styles.eventInfoContainer}>
            <CoOrganizerInvitationBanner
              eventId={eventData.id}
              onAnswered={() => updateEvent()}
            />
            <p className={styles.eventTags}>
              {eventData.eventCategories
                ?.map((cat) => cat.category.name)
                .join(" · ")}
            </p>
            <h1 className={styles.title}>{eventData.title}</h1>
            <div className={styles.eventInfoCard}>
              <ArrangerLine eventData={eventData} />
              <DateTimeRow eventData={eventData} />
              <LocationRow eventData={eventData} mapsUrl={mapsUrl} />
              <FoodRow eventData={eventData} />
              <GoingCountSection
                goingCount={goingCount}
                eventData={eventData}
                registrations={registrations}
              />
            </div>
          </div>
          <div className={styles.descWrapper}>
            <div className={styles.descHeaderWrapper}>
              <ShareButtons eventData={eventData} isArranger={isArranger} />
              <h2 className={styles.descHeader}>Informasjon</h2>
            </div>
            <DescriptionText
              text={eventData.description}
              className={styles.descriptionContainer}
              paragraphClassName={styles.descText}
            />
          </div>
          <UpdatesSection
            updates={updates}
            isArranger={isArranger}
            mutateUpdates={mutateUpdates}
          />
          <RegistrationAction
            eventData={eventData}
            updateEvent={updateEvent}
            mutateUpdates={mutateUpdates}
          />
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
  /* eid is validated with isValidEventId before we get here; encoding keeps
     the value inside a single path segment regardless. */
  const eventUrl = `${baseApiUrl}/events/${encodeURIComponent(
    eid.toUpperCase(),
  )}`;

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
  const baseApiUrl =
    process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!eid || !isValidEventId(eid)) {
    return {
      notFound: true,
    };
  }

  try {
    if (!baseApiUrl) {
      throw new Error("Missing API base URL");
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
        event,
      },
    };
  } catch (error) {
    console.error("Failed to fetch event %s:", eid, error);
    return {
      notFound: true,
    };
  }
};

export default Event;
