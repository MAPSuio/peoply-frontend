/* Next. */
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

/* React. */
import { useEffect, useState } from "react";

/* Components. */
import Navbar from "../../components/Navbar";
import LargeEventCard from "../../components/LargeEventCard";
import Button from "../../components/Button";
import TabSelection from "../../components/TabSelection";
import HeadComponent from "../../components/HeadComponent";

/* Hooks. */
import useUser from "../../hooks/useUser";

/* Utils. */
import { formatDateRange, getWeekday } from "../../utils/functions";

/* Services. */
import { fetchFromPeoplyApiJson } from "../../services/fetchers";

/* Types. */
import {
  Event,
  Favorite,
  Registration,
  RegStatus,
  SectionTypes,
} from "../../types/types";

/* Assets. */
import ListIcon from "../../components/svgs/ListIcon";
import CalendarIconSummary from "../../components/svgs/CalendarIconSummary";
import HeartIcon from "../../components/svgs/HeartIcon";
import NoFavoriteImage from "../../assets/images/undraw_no_favorites.png";

/* Styles. */
import styles from "../../styles/MyEvents.module.scss";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import { isEventFinished } from "../../utils/event";

const MyEvents = () => {
  const [activeSection, setActiveSection] = useState(SectionTypes.REGISTERED);
  const [activeRegistrations, setActiveRegistrations] = useState<any[]>([]);
  const [dateAndEventsMap, setDateAndEventsMap] = useState(new Map());
  const [dateAndEventsMapArray, setDateAndEventsMapArray] = useState<any[]>([]);
  const { user, loading } = useUser();
  const redirectToLogin = useRedirectToLogin();

  const { data: eventsArranging, error: myEventsError } = useSWR<Event[]>(
    `/users/${user?.id}/arranging`,
    fetchFromPeoplyApiJson,
  );
  const { data: eventsFavorited, error: myFavoritesError } = useSWR<Favorite[]>(
    `/users/${user?.id}/favorites?includeEvent=true&includeArrangers=true`,
    fetchFromPeoplyApiJson,
  );
  const { data: eventsGoing, error: myGoingError } = useSWR<Registration[]>(
    `/users/${user?.id}/registrations?regStatus=${RegStatus.GOING}&includeEvent=true&includeArrangers=true`,
    fetchFromPeoplyApiJson,
  );

  const changeActiveSection = (section: SectionTypes) => {
    setActiveSection(section);

    switch (section) {
      case SectionTypes.REGISTERED:
        if (eventsGoing) setActiveRegistrations([...eventsGoing]);
        break;
      case SectionTypes.FAVORITES:
        if (eventsFavorited) setActiveRegistrations([...eventsFavorited]);
        break;
      case SectionTypes.MY_EVENTS:
        if (eventsArranging) setActiveRegistrations([...eventsArranging]);
        break;
      default:
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

  function convertSectionTypeToLabel(section: SectionTypes) {
    switch (section) {
      case SectionTypes.REGISTERED:
        return "Skal";
      case SectionTypes.FAVORITES:
        return "Favoritter";
      case SectionTypes.MY_EVENTS:
        return "Arrangerer";
      default:
        return "";
    }
  }

  if (loading) {
    return <></>;
  }

  if (!user) {
    redirectToLogin();
    return <></>;
  }

  const hasFutureEvents = dateAndEventsMapArray.some(
    (dateAndEvents) =>
      new Date(dateAndEvents.date).getTime() >= new Date().getTime(),
  );

  const hasPastEvents = dateAndEventsMapArray.some((dateAndEvents) => {
    const date = new Date(dateAndEvents.date);
    return date < new Date();
  });

  return (
    <>
      <HeadComponent
        title="Mine arrangementer"
        description="Her kan du se hvilke arrangementer du er meldt på, hvilke du har markert som favoritter og hvilke du har opprettet."
      />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <TabSelection
            options={[
              {
                label: convertSectionTypeToLabel(SectionTypes.REGISTERED),
                value: SectionTypes.REGISTERED,
                icon: <CalendarIconSummary />,
              },
              {
                label: convertSectionTypeToLabel(SectionTypes.FAVORITES),
                value: SectionTypes.FAVORITES,
                icon: <HeartIcon />,
              },
              {
                label: convertSectionTypeToLabel(SectionTypes.MY_EVENTS),
                value: SectionTypes.MY_EVENTS,
                icon: <ListIcon />,
              },
            ]}
            selected={activeSection}
            setSelected={changeActiveSection}
          />

          <div className={styles.eventContainer}>
            {dateAndEventsMapArray.length > 0 ? (
              dateAndEventsMapArray
                .sort(
                  (dateAndEventA, dateAndEventB) =>
                    new Date(dateAndEventA.date).getTime() -
                    new Date(dateAndEventB.date).getTime(),
                )
                .map((dateAndEvent, index) => {
                  const date = new Date(dateAndEvent.date);
                  const events = (dateAndEvent.events as Event[]).filter(
                    (event) => !isEventFinished(event),
                  );
                  const dateString = formatDateRange(date, date).slice(0, -5); // TODO: This needs work.
                  const weekday = getWeekday(date);

                  if (!events.length) {
                    return null;
                  }

                  return (
                    <div
                      key={index}
                      className={events.length > 1 ? styles.multiple : ""}
                    >
                      <p className={styles.dateTag}>{weekday}</p>
                      <h2 className={styles.dateTitle}>{dateString}</h2>
                      <div className={styles.eventCardsContainer}>
                        {events.map((event: Event) => (
                          <LargeEventCard
                            key={event.id}
                            event={event}
                            showArranger
                          /> // TODO: The returned card should be different based on which event type it is.
                        ))}
                      </div>
                    </div>
                  );
                })
            ) : (
              <EmptyEvents eventType={activeSection} />
            )}
          </div>
          {hasPastEvents && (
            <>
              {hasFutureEvents && <span className={styles.divider}></span>}
              <div className={styles.pastEvents}>
                <div className={styles.pastEventsHeader}>
                  <h2>Tidligere arrangementer</h2>
                  <p>Gjenopplev tidligere arrangementer</p>
                </div>
                <div className={styles.eventContainer}>
                  {dateAndEventsMapArray.length > 0 ? (
                    dateAndEventsMapArray
                      .sort(
                        (dateAndEventA, dateAndEventB) =>
                          new Date(dateAndEventB.date).getTime() -
                          new Date(dateAndEventA.date).getTime(),
                      )
                      .map((dateAndEvent, index) => {
                        const events = (dateAndEvent.events as Event[]).filter(
                          (event) => isEventFinished(event),
                        );

                        if (!events.length) {
                          return null;
                        }

                        return (
                          <div
                            key={index}
                            className={events.length > 1 ? styles.multiple : ""}
                          >
                            <div className={styles.eventCardsContainer}>
                              {events.map((event: Event) => (
                                <LargeEventCard
                                  key={event.id}
                                  event={event}
                                  showArranger
                                /> // TODO: The returned card should be different based on which event type it is.
                              ))}
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <EmptyEvents eventType={activeSection} />
                  )}
                </div>
              </div>
            </>
          )}
          <Navbar />
        </div>
      </div>
    </>
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
    } else if (eventType === SectionTypes.MY_EVENTS) {
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
        {eventType === SectionTypes.MY_EVENTS ? (
          <Link href="/events/create">
            <a className={styles.button}>
              <Button text="Opprett et nytt arrangement" />
            </a>
          </Link>
        ) : eventType === SectionTypes.REGISTERED ? (
          <Link href="/">
            <a className={styles.button}>
              <Button text="Sjekk ut arrangementer" />
            </a>
          </Link>
        ) : (
          <Link href="/">
            <a className={styles.button}>
              <Button text="Sjekk ut arrangementer" />
            </a>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
