/* Next. */
import Image from "next/image";
import Link from "next/link";

/* React. */
import { useEffect, useState } from "react";

/* Components. */
import Navbar from "../../components/Navbar";
import MyEventCard from "../../components/MyEventCard";
import ContinueWithVippsButton from "../../components/svgs/ContinueWithVippsButton";
import Button from "../../components/Button";

/* Utils. */
import { registerForEventTest } from "../../services/events";
import { formatDateRange, getWeekday } from "../../utils/functions";

/* Hooks. */
import useUser from "../../hooks/useUser";
import useSnack from "../../hooks/useSnack";

/* Types. */
import {
  Event,
  Favorite,
  Registration,
  RegStatus,
  SectionTypes,
  SnackTypes,
} from "../../types/types";

/* Assets. */
import ChevronDownIcon from "../../components/svgs/ChevronDownIcon";
import ListIcon from "../../components/svgs/ListIcon";
import CalendarIconSummary from "../../components/svgs/CalendarIconSummary";
import HeartIcon from "../../components/svgs/HeartIcon";
import LogInImage from "../../assets/images/undraw_login.png";
import NoFavoriteImage from "../../assets/images/undraw_no_favorites.png";

/* Styles. */
import styles from "../../styles/MyEvents.module.scss";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useSWR from "swr";

const MyEvents = () => {
  const [activeSection, setActiveSection] = useState(SectionTypes.REGISTERED);
  const [activeRegistrations, setActiveRegistrations] = useState<any[]>([]);
  const [dateAndEventsMap, setDateAndEventsMap] = useState(new Map());
  const [dateAndEventsMapArray, setDateAndEventsMapArray] = useState<any[]>([]);
  const { user, loading, error } = useUser();
  const { addSnack } = useSnack();

  const { data: eventsArranging, error: myEventsError } = useSWR<Event[]>(
    `/users/${user?.id}/arranging`,
    fetchFromPeoplyApiJson,
  );
  const { data: eventsFavorited, error: myFavoritesError } = useSWR<Favorite[]>(
    `/users/${user?.id}/favorites?includeEvent=true`,
    fetchFromPeoplyApiJson,
  );
  const { data: eventsGoing, error: myGoingError } = useSWR<Registration[]>(
    `/users/${user?.id}/registrations?regStatus=${RegStatus.GOING}&includeEvent=true`,
    fetchFromPeoplyApiJson,
  );

  /* Keep for future reference. Can be deleted later. */
  const register = () => {
    registerForEventTest(user!.id).then((res) => {
      if (!res) {
        addSnack(
          "Du er allerede meldt på det arrangementet.",
          SnackTypes.ERROR,
        );
      }
    });
  };

  const changeActiveSection = (section: SectionTypes) => {
    setActiveSection(section);

    switch (section) {
      case SectionTypes.REGISTERED:
        if (eventsGoing) setActiveRegistrations(eventsGoing);
        break;
      case SectionTypes.FAVORITES:
        if (eventsFavorited) setActiveRegistrations(eventsFavorited);
        break;
      case SectionTypes.MYEVENTS:
        if (eventsArranging) setActiveRegistrations([...eventsArranging]);
        break;
      default:
        console.log("default triggered:", activeRegistrations);
        break;
    }
  };

  useEffect(() => {
    if (user) {
      /* Set the default active event section. */
      if (eventsGoing) {
        setActiveSection(SectionTypes.REGISTERED);
        setActiveRegistrations(eventsGoing);
      }
    }
  }, [user, eventsGoing]);

  useEffect(() => {
    dateAndEventsMap.clear();

    activeRegistrations.map((event: Registration) => {
      const eventData = event.event;
      const startDate = new Date(eventData.startDate);
      startDate.setHours(0, 0, 0, 0);
      const dateString = startDate.toISOString();

      if (dateAndEventsMap.get(dateString)) {
        setDateAndEventsMap(
          dateAndEventsMap.set(dateString, [
            eventData,
            ...dateAndEventsMap
              .get(dateString)
              .filter((event: Event) => event.id !== eventData.id),
          ]),
        );
      } else {
        setDateAndEventsMap(dateAndEventsMap.set(dateString, [eventData]));
      }
    });
    const dateAndEventsArray: Array<{ date: string; events: Array<Event> }> =
      [];

    dateAndEventsMap.forEach((val, key) => {
      dateAndEventsArray.push({ date: key, events: val });
    });

    setDateAndEventsMapArray(dateAndEventsArray);
  }, [activeRegistrations, dateAndEventsMap]);

  if (user) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.userContainer}>
            <h1 className={styles.title}>{user.firstName}</h1>
            <ChevronDownIcon className={styles.chevronDownIcon} />
          </div>
          <div className={styles.sectionButtonsContainer}>
            <div className={styles.buttonsContainer}>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.REGISTERED)}
              >
                <CalendarIconSummary
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.REGISTERED && styles.active
                  }`}
                />
                {activeSection === SectionTypes.REGISTERED && (
                  <span className={styles.activeLine} />
                )}
              </button>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.FAVORITES)}
              >
                <HeartIcon
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.FAVORITES && styles.active
                  }`}
                />
                {activeSection === SectionTypes.FAVORITES && (
                  <span className={styles.activeLine} />
                )}
              </button>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.MYEVENTS)}
              >
                <ListIcon
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.MYEVENTS && styles.active
                  }`}
                />
                {activeSection === SectionTypes.MYEVENTS && (
                  <span className={styles.activeLine} />
                )}
              </button>
            </div>
          </div>

          <div className={styles.eventContainer}>
            {dateAndEventsMapArray.length > 0 ? (
              dateAndEventsMapArray.map((dateAndEvent, index) => {
                const date = new Date(dateAndEvent.date);
                const events = dateAndEvent.events;
                const dateString = formatDateRange(date, date).slice(0, -5); // TODO: This needs work.
                const weekday = getWeekday(date);

                return (
                  <div key={index} className={styles.dateAndEventsContainer}>
                    <p className={styles.dateTag}>{weekday}</p>
                    <h2 className={styles.dateTitle}>{dateString}</h2>
                    <div className={styles.eventCardsContainer}>
                      {events.map((event: Event) => (
                        <MyEventCard key={event.id} event={event} /> // TODO: The returned card should be different based on which event type it is.
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <EmptyEvents eventType={activeSection} />
            )}
          </div>
          <Navbar />
        </div>
      </div>
    );
  } else if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <div className={styles.userContainer}>
            <h1 className={styles.title}>Hans</h1>
            <ChevronDownIcon className={styles.chevronDownIcon} />
          </div>
          <div className={styles.sectionButtonsContainer}>
            <div className={styles.buttonsContainer}>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.REGISTERED)}
              >
                <CalendarIconSummary
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.REGISTERED && styles.active
                  }`}
                />
                {activeSection === SectionTypes.REGISTERED && (
                  <span className={styles.activeLine} />
                )}
              </button>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.FAVORITES)}
              >
                <HeartIcon
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.FAVORITES && styles.active
                  }`}
                />
                {activeSection === SectionTypes.FAVORITES && (
                  <span className={styles.activeLine} />
                )}
              </button>
              <button
                className={styles.button}
                onClick={() => changeActiveSection(SectionTypes.MYEVENTS)}
              >
                <ListIcon
                  className={`${styles.sectionIcon} ${
                    activeSection === SectionTypes.MYEVENTS && styles.active
                  }`}
                />
                {activeSection === SectionTypes.MYEVENTS && (
                  <span className={styles.activeLine} />
                )}
              </button>
            </div>
          </div>

          <div className={styles.eventContainer}>
            {/* Add loading indicator here, with skeleton loading screens before launch. */}
          </div>
          <Navbar />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h1 className={`${styles.title} ${styles.marginBottomMedium}`}>
          Du er ikke logget inn!
        </h1>
        <div className={styles.imageContainer}>
          <Image
            src={LogInImage}
            alt="En liten figur ved siden av en mobil"
            placeholder="blur"
          />
        </div>
        <div className={styles.loginButtonContainer}>
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login`}>
            <ContinueWithVippsButton />
          </a>
          <p className={styles.loginButtonText}>
            Hvis du har logget inn før, vil du bli tatt til din gamle bruker.
            Hvis ikke vil en ny bruker bli opprettet
          </p>
        </div>
        <Navbar />
      </div>
    </div>
  );
};

interface EmptyEventsProps {
  eventType: SectionTypes;
}
const EmptyEvents = ({ eventType }: EmptyEventsProps) => {
  const getErrorText = () => {
    if (eventType === SectionTypes.REGISTERED) {
      return "Du er ikke meldt på noen arrangementer!";
    } else if (eventType === SectionTypes.FAVORITES) {
      return "Du har ikke markert noen arrangementer som favoritt!";
    } else if (eventType === SectionTypes.MYEVENTS) {
      return "Du har ikke opprettet noen arrangementer!";
    }
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <h2 className={styles.errorTitle}>{getErrorText()}</h2>
        <div className={styles.imageContainer}>
          <Image
            src={NoFavoriteImage}
            alt="Et trist ansikt ved siden av en dame"
            placeholder="blur"
          />
        </div>
        {eventType === SectionTypes.MYEVENTS ? (
          <Link href="/event/create" passHref>
            <Button text="Opprett et nytt arrangement" isLink />
          </Link>
        ) : eventType === SectionTypes.REGISTERED ? (
          <Link href="/" passHref>
            <Button text="Sjekk ut arrangementer" isLink />
          </Link>
        ) : (
          <Link href="/" passHref>
            <Button text="Sjekk ut arrangementer" isLink />
          </Link>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
