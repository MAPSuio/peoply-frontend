import dynamic from "next/dynamic";
import { useMemo } from "react";
import useSWR from "swr";

import BackButton from "../components/BackButton";
import HeadComponent from "../components/HeadComponent";
import Layout from "../components/Layout";
import LoadingWheel from "../components/LoadingWheel";
import Navbar from "../components/Navbar";
import useBack from "../hooks/useBack";
import { fetchAllFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/CalendarPage.module.scss";
import { Alignment, Event } from "../types/types";
import { queryToString } from "../utils/functions";

const EventCalendar = dynamic(() => import("../components/EventCalendar"), {
  ssr: false,
  loading: () => <LoadingWheel />,
});

export default function CalendarPage() {
  const goBack = useBack();
  const eventsQuery = useMemo(() => {
    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setFullYear(rangeEnd.getFullYear() + 1);

    return {
      afterDate: rangeStart.toISOString(),
      beforeDate: rangeEnd.toISOString(),
      orderBy: "startDate",
      orderDirection: "asc",
    };
  }, []);

  const { data: events, error } = useSWR<Event[]>(
    `/events?${queryToString(eventsQuery)}`,
    fetchAllFromPeoplyApiJson,
  );

  return (
    <>
      <HeadComponent
        title="Kalender"
        description="Kalenderoversikt over kommende arrangementer."
        path="/kalender"
      />
      <BackButton onClick={goBack} style={{ marginLeft: "5%" }} />
      <Layout align={Alignment.CENTER}>
        <div className={styles.pageHeader}>
          <h1>Kalender</h1>
        </div>

        {error && (
          <div className={styles.stateCard}>
            <h2>Kunne ikke laste kalenderen</h2>
            <p>Prøv igjen om litt.</p>
          </div>
        )}

        {!error && !events && <LoadingWheel />}

        {!error && events && (
          <section className={styles.calendarCard}>
            <EventCalendar events={events} />
          </section>
        )}
      </Layout>
      <Navbar />
    </>
  );
}
