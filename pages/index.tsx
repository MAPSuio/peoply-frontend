// Next.js.
import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import Link from "next/link";
import useSWR from "swr";

// React.
import { useEffect, useState } from "react";

// Components.
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import HeadComponent from "../components/HeadComponent";
import Header from "../components/Header";
import OrganizationAvatar from "../components/OrganizationAvatar";
import HighlightedEventCard from "../components/HighlightedEventCard";

// Swiper.
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";
import SwiperCore, {
  Scrollbar,
  Mousewheel,
  FreeMode,
  Navigation,
} from "swiper";
SwiperCore.use([Scrollbar, Mousewheel, FreeMode, Navigation]); // Install swiper modules.

// Services.
import { fetchFromPeoplyApiJson } from "../services/fetchers";

// Utils.
import { queryToString } from "../utils/functions";

// Types.
import { UrlObject } from "url";
import {
  ArrangerFollower,
  ButtonType,
  Event,
  Organization,
} from "../types/types";

// Styles.
import styles from "../styles/Home.module.scss";
import modalStyles from "../styles/Modal.module.scss";
import useUser from "../hooks/useUser";
import Modal from "../components/Modal";
import ModalButton from "../components/ModalButton";

const Home: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const router = useRouter();
  const { user } = useUser();
  const [todayString, setTodayString] = useState<string>(
    new Date().toISOString(),
  );
  const [showPeoplyMapsModal, setShowPeoplyMapsModal] =
    useState<boolean>(false);

  const { data: followedArrangers, error: followedArrangersError } = useSWR<
    ArrangerFollower[]
  >(user ? `/users/${user.id}/following` : null, fetchFromPeoplyApiJson);

  useEffect(() => {
    const today = new Date();
    today.setHours(today.getHours() - 2);
    const s = today.toISOString();
    setTodayString(s);
  }, []);

  useEffect(() => {
    if (localStorage.getItem("peoply-maps-modal-closed")) {
      return;
    }
    setShowPeoplyMapsModal(true);
  }, []);

  const featuredEventsQuery = {
    featured: true,
    afterDate: todayString,
    orderBy: "startDate",
  };

  const eventsQuery = {
    afterDate: todayString,
    orderBy: "startDate",
  };

  // temporary list before we get a solution for the API
  const ifiOrgs = [
    "990110352", // CYB
    "990995303", // navet
    "987042583", // dagen
    "911594242", // Ifi-Progsys
    "915439721", // Defi
    "919650354", // Digitus
    "997875400", // Språktek
    "991739815", // mikro
    "995251884", // MAPS
    "920547230", // Toastjærn
    "928941027", // IF1
    "930732273", // ifi FOKUS
    "930289264", // IFI-Logen
    "928728854", // readLine
    "996784991", // FUI
    "931559265", // BrewFI
    "998088062", // FIFI
  ];

  // const eventsOnIfiQuery = { ...eventsQuery, categoryIds: "3" }; // IFI category id
  const eventsFromFollowedArrangersQuery = {
    ...eventsQuery,
    arrangerIds: followedArrangers?.map((a) => a.arrangerId),
  };
  const ifiOrgsQuery = { orgNrs: ifiOrgs.join(","), take: 20 };

  // const { data: eventsOnIFI, error: eventsOnIFIError } = useSWR<Event[]>(
  //   `/events?${queryToString(eventsOnIfiQuery)}`,
  //   fetchFromPeoplyApiJson,
  // );

  const { data: futureEvents, error: futureEventsError } = useSWR<Event[]>(
    `/events?${queryToString(eventsQuery)}`,
    fetchFromPeoplyApiJson,
  );

  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(`/organizations?${queryToString(ifiOrgsQuery)}`, fetchFromPeoplyApiJson);

  const { data: featuredEvents, error: featuredEventsError } = useSWR<Event[]>(
    `/events?${queryToString(featuredEventsQuery)}`,
    fetchFromPeoplyApiJson,
  );

  const {
    data: eventsFromFollowedArrangers,
    error: eventsFromFollowedArrangersError,
  } = useSWR<Event[]>(
    followedArrangers && followedArrangers.length > 0
      ? `/events?${queryToString(eventsFromFollowedArrangersQuery)}`
      : null,
    fetchFromPeoplyApiJson,
  );

  return (
    <>
      <HeadComponent
        title="Peoply"
        description="Frontsiden til Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
      <Header />
      <div className={styles.container}>
        {featuredEvents && featuredEvents.length > 0 && (
          <HighlightedEventCard event={featuredEvents[0]} />
        )}
        {organizations && organizations.length > 0 && (
          <OrganizationSwiper
            header="Foreninger på IFI"
            seeAllUrl={{ pathname: "/orgs", query: ifiOrgsQuery }}
            organizations={organizations}
            error={organizationsError}
          />
        )}
        {eventsFromFollowedArrangers && eventsFromFollowedArrangers.length > 0 && (
          <EventSwiper
            header="Fra arrangører du følger"
            seeAllUrl={{
              pathname: "/events",
              query: eventsFromFollowedArrangersQuery,
            }}
            events={eventsFromFollowedArrangers}
            error={eventsFromFollowedArrangersError}
          />
        )}
        {/* {eventsOnIFI && eventsOnIFI.length > 0 ? (
          <EventSwiper
            header={"Hva skjer på IFI?"}
            seeAllUrl={{ pathname: `/events`, query: eventsOnIfiQuery }}
            events={eventsOnIFI}
            error={eventsOnIFIError}
          />
        ) : undefined}
 */}
        {futureEvents && futureEvents.length > 0 ? (
          <EventSwiper
            header={"Hva skjer fremover?"}
            seeAllUrl={{ pathname: `/events`, query: eventsQuery }}
            events={futureEvents}
            error={futureEventsError}
          />
        ) : undefined}
      </div>
      <Navbar />
      {showPeoplyMapsModal && (
        <Modal
          label="MAPS tar over! 🎉"
          // description="Vipps legger Logg-inn bak betalingsmur 1. august 2024. Hvis noen foreninger ønsker å holde liv i Peoply, ta gjerne kontakt med oss på post@decidable.no. Vi øverfører gjerne driften til en forening som ønsker å drifte tjenesten videre, og kanskje til og med videreutvikle den! Vi bistår selvfølgelig med oppsett av infrastruktur og gir dere en innføring i kodebasen. Dette er en kul mulighet for studenter til å få erfaring med å drifte en tjeneste som brukes av mange studenter på IFI."
          closeButtonOnClick={() => {
            localStorage.setItem("peoply-maps-modal-closed", "true");
            setShowPeoplyMapsModal(false);
          }}
        >
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginTop: "-2rem",

                marginBottom: "1rem",
              }}
            >
              <p className={modalStyles.description}>
                Vi i MAPS har vært så heldig å få overta eierskap og drift av
                Peoply fra Decidable.
              </p>

              <p className={modalStyles.description}>
                Ta gjerne kontakt med oss på mail om det skulle være noe. Vi
                gleder oss til å komme i gang!
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                <img
                  src="/maps.jpg"
                  className={modalStyles.description}
                  width="300px"
                  alt="Nature"
                />
              </div>

              <p className={modalStyles.description}>
                PS: Kom på Will Code For Drinks 27/09 🥳
              </p>
            </div>
            <ModalButton
              text="kult🔥"
              onClick={() => {
                localStorage.setItem("peoply-maps-modal-closed", "true");
                setShowPeoplyMapsModal(false);
              }}
            />
            <ModalButton
              text="Ta kontakt! 🚀"
              type={ButtonType.HIGHLIGHTEDEVENTCARD}
              onClick={() => {
                window.open(
                  "mailto:maps-kontakt@studorg.uio.no?subject=Peoply",
                );
                localStorage.setItem("peoply-maps-modal-closed", "true");
                setShowPeoplyMapsModal(false);
              }}
            />
          </>
        </Modal>
      )}
    </>
  );
};

interface EventSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  events: Event[];
  error: Error | null;
}

const EventSwiper = ({
  header,
  seeAllUrl,
  events,
  error,
}: EventSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h1>{header}</h1>
        <Link href={seeAllUrl}>
          <a className={styles.link}>Se alle</a>
        </Link>
      </div>
      <Swiper
        className={styles.mySwiper}
        mousewheel={{ forceToAxis: true }}
        spaceBetween={16}
        slidesPerView={"auto"}
        freeMode={{ enabled: true }}
      >
        {events?.map((event: any) => (
          <SwiperSlide key={event.urlId} className={styles.mySwiperSlide}>
            <Link
              href={{
                pathname: "/events/[eventId]",
                query: { eventId: event.urlId },
              }}
            >
              <a>
                <EventCard event={event} />
              </a>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

interface OrganizationSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  organizations: Organization[];
  error: Error | null;
}
const OrganizationSwiper = ({
  header,
  seeAllUrl,
  organizations,
  error,
}: OrganizationSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <div className={styles.swiperHeader}>
        <h1>{header}</h1>
        <Link href={seeAllUrl}>
          <a className={styles.link}>Se alle</a>
        </Link>
      </div>
      <Swiper
        className={styles.mySwiper}
        mousewheel={{ forceToAxis: true }}
        spaceBetween={16}
        slidesPerView={"auto"}
        freeMode={{ enabled: true }}
      >
        {organizations?.map((organization: Organization) => (
          <SwiperSlide key={organization.id} className={styles.swiperSlideOrg}>
            <Link href={`/orgs/${organization.urlId ?? organization.id}`}>
              <a>
                <OrganizationAvatar organization={organization} />
              </a>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Home;
