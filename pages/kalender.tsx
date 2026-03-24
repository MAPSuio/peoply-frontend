import Link from "next/link";
import { useMemo, useState } from "react";
import useSWR from "swr";

import Header from "../components/Header";
import HeadComponent from "../components/HeadComponent";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/CalendarPage.module.scss";
import { Alignment, Event } from "../types/types";
import { queryToString } from "../utils/functions";

type CalendarView = "month" | "week";

interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  events: Event[];
}

type NormalizedEvent = Omit<Event, "startDate"> & {
  startDate: Date;
};

const DAYS_IN_WEEK = 7;
const MAX_EVENTS = 500;

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function startOfWeek(date: Date) {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  nextDate.setDate(nextDate.getDate() + diff);
  return nextDate;
}

function endOfWeek(date: Date) {
  const nextDate = startOfWeek(date);
  nextDate.setDate(nextDate.getDate() + 6);
  return nextDate;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function formatEventTime(event: Event) {
  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;

  if (!endDate) {
    return startDate.toLocaleTimeString("nb-NO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return `${startDate.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  })}-${endDate.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getArrangerName(event: Event) {
  const organizationName = event.eventArrangers?.find(
    (eventArranger) => eventArranger.arranger.organization?.name,
  )?.arranger.organization?.name;

  if (organizationName) {
    return organizationName;
  }

  const arrangerUser = event.eventArrangers?.[0]?.arranger.user;
  if (arrangerUser) {
    return `${arrangerUser.firstName} ${arrangerUser.lastName}`.trim();
  }

  return "Peoply";
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [focusedDate, setFocusedDate] = useState(startOfDay(new Date()));

  const rangeStart = useMemo(() => startOfDay(new Date()), []);
  const rangeEnd = useMemo(() => {
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    return nextDate;
  }, []);

  const eventsQuery = useMemo(
    () => ({
      afterDate: rangeStart.toISOString(),
      beforeDate: rangeEnd.toISOString(),
      orderBy: "startDate",
      orderDirection: "asc",
      take: `${MAX_EVENTS}`,
    }),
    [rangeEnd, rangeStart],
  );

  const { data: events, error } = useSWR<Event[]>(
    `/events?${queryToString(eventsQuery)}`,
    fetchFromPeoplyApiJson,
  );

  const normalizedEvents = useMemo<NormalizedEvent[]>(
    () =>
      (events ?? []).map((event) => ({
        ...event,
        startDate: new Date(event.startDate),
      })),
    [events],
  );

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(focusedDate);
    const monthEnd = endOfMonth(focusedDate);
    const gridStart = startOfWeek(monthStart);
    const gridEnd = endOfWeek(monthEnd);
    const days: CalendarDay[] = [];

    for (
      let cursor = new Date(gridStart);
      cursor <= gridEnd;
      cursor = addDays(cursor, 1)
    ) {
      days.push({
        date: new Date(cursor),
        inCurrentMonth: cursor.getMonth() === monthStart.getMonth(),
        events: normalizedEvents.filter((event) =>
          isSameDay(event.startDate, cursor),
        ),
      });
    }

    return days;
  }, [focusedDate, normalizedEvents]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(focusedDate);

    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
      const date = addDays(weekStart, index);

      return {
        date,
        inCurrentMonth: true,
        events: normalizedEvents.filter((event) =>
          isSameDay(event.startDate, date),
        ),
      };
    });
  }, [focusedDate, normalizedEvents]);

  const canGoPrevious =
    view === "month"
      ? startOfMonth(focusedDate) > startOfMonth(rangeStart)
      : startOfWeek(focusedDate) > startOfWeek(rangeStart);

  const canGoNext =
    view === "month"
      ? startOfMonth(focusedDate) < startOfMonth(rangeEnd)
      : startOfWeek(focusedDate) < startOfWeek(rangeEnd);

  const activeMonthLabel = startOfMonth(focusedDate).toLocaleDateString(
    "nb-NO",
    {
      month: "long",
      year: "numeric",
    },
  );

  const activeWeekLabel = `${startOfWeek(focusedDate).toLocaleDateString(
    "nb-NO",
    {
      day: "numeric",
      month: "short",
    },
  )} - ${endOfWeek(focusedDate).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

  const navigate = (direction: -1 | 1) => {
    setFocusedDate((currentDate) =>
      view === "month"
        ? addMonths(currentDate, direction)
        : addDays(currentDate, direction * 7),
    );
  };

  const goToToday = () => {
    setFocusedDate(startOfDay(new Date()));
  };

  const renderEvent = (event: Event) => (
    <Link
      key={event.id}
      href={`/events/${event.urlId}`}
      className={styles.eventChip}
    >
      <span className={styles.eventOrg}>{getArrangerName(event)}</span>
      <strong>{event.title}</strong>
      <span>{formatEventTime(event)}</span>
    </Link>
  );

  return (
    <>
      <HeadComponent
        title="Kalender"
        description="Se alle kommende arrangementer uke for uke eller måned for måned."
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/kalender`}
      />
      <Header />
      <Layout align={Alignment.CENTER}>
        <div className={styles.pageHeader}>
          <div>
            <p className={styles.eyebrow}>Kalender</p>
            <h1>Alle arrangementer i én kalender</h1>
            <p>
              Få oversikt over kommende arrangementer opptil ett år frem i tid,
              med uke- og månedsvisning.
            </p>
          </div>
          <Link href="/events" className={styles.secondaryLink}>
            Gå til listevisning
          </Link>
        </div>

        <section className={styles.controlsCard}>
          <div className={styles.viewSwitcher}>
            <button
              className={`${styles.viewButton} ${
                view === "month" ? styles.viewButtonActive : ""
              }`}
              onClick={() => setView("month")}
            >
              Måned
            </button>
            <button
              className={`${styles.viewButton} ${
                view === "week" ? styles.viewButtonActive : ""
              }`}
              onClick={() => setView("week")}
            >
              Uke
            </button>
          </div>

          <div className={styles.navigationControls}>
            <button
              className={styles.navButton}
              onClick={() => navigate(-1)}
              disabled={!canGoPrevious}
            >
              Forrige
            </button>
            <div className={styles.activeRange}>
              {view === "month" ? activeMonthLabel : activeWeekLabel}
            </div>
            <button
              className={styles.navButton}
              onClick={() => navigate(1)}
              disabled={!canGoNext}
            >
              Neste
            </button>
            <button className={styles.todayButton} onClick={goToToday}>
              I dag
            </button>
          </div>
        </section>

        {!events && !error && (
          <div className={styles.emptyState}>
            <h2>Laster kalenderen...</h2>
            <p>Henter kommende arrangementer.</p>
          </div>
        )}

        {error && (
          <div className={styles.emptyState}>
            <h2>Kunne ikke laste kalenderen</h2>
            <p>Prøv igjen om litt.</p>
          </div>
        )}

        {events && !error && view === "month" && (
          <section className={styles.calendarCard}>
            <div className={styles.weekdayRow}>
              {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((day) => (
                <div key={day} className={styles.weekdayCell}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.monthGridWrapper}>
              <div className={styles.monthGrid}>
                {monthDays.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={`${styles.dayCell} ${
                      day.inCurrentMonth ? "" : styles.dayCellMuted
                    } ${
                      isSameDay(day.date, new Date()) ? styles.dayCellToday : ""
                    }`}
                  >
                    <div className={styles.dayNumber}>{day.date.getDate()}</div>
                    <div className={styles.dayEvents}>
                      {day.events.slice(0, 3).map(renderEvent)}
                      {day.events.length > 3 && (
                        <div className={styles.moreEvents}>
                          +{day.events.length - 3} flere
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {events && !error && view === "week" && (
          <section className={styles.calendarCard}>
            <div className={styles.weekGridWrapper}>
              <div className={styles.weekGrid}>
                {weekDays.map((day) => (
                  <div
                    key={day.date.toISOString()}
                    className={`${styles.weekColumn} ${
                      isSameDay(day.date, new Date()) ? styles.dayCellToday : ""
                    }`}
                  >
                    <div className={styles.weekColumnHeader}>
                      <h2>
                        {day.date.toLocaleDateString("nb-NO", {
                          weekday: "short",
                        })}
                      </h2>
                      <span>
                        {day.date.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    {day.events.length > 0 ? (
                      <div className={styles.weekDayEvents}>
                        {day.events.map(renderEvent)}
                      </div>
                    ) : (
                      <p className={styles.noEventsText}>
                        Ingen arrangementer denne dagen.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </Layout>
      <Navbar />
    </>
  );
}
