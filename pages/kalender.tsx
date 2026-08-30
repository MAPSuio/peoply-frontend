import dynamic from "next/dynamic";
import { useMemo } from "react";
import useSWR from "swr";

import BackButton from "../components/BackButton";
import HeadComponent from "../components/HeadComponent";
import Layout from "../components/Layout";
import LoadingWheel from "../components/LoadingWheel";
import Navbar from "../components/Navbar";
import QueryState from "../components/QueryState";
import useBack from "../hooks/useBack";
import { fetchAllFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/CalendarPage.module.scss";
import { Alignment, type Event } from "../types/types";
import { rollingCalendarRange } from "../utils/calendarEvents";
import { queryToString } from "../utils/functions";

const EventCalendar = dynamic(() => import("../components/EventCalendar"), {
  ssr: false,
  loading: () => <LoadingWheel />,
});

export default function CalendarPage() {
  const goBack = useBack();
  const range = useMemo(() => rollingCalendarRange(new Date()), []);
  const eventsQuery = useMemo(
    () => ({
      afterDate: range.start.toISOString(),
      beforeDate: range.end.toISOString(),
      orderBy: "startDate",
      orderDirection: "asc",
    }),
    [range],
  );

  const eventsQueryResult = useSWR<Event[]>(
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

        <QueryState
          query={eventsQueryResult}
          errorMessage="Kunne ikke laste kalenderen. Prøv igjen om litt."
          className={styles.stateWidth}
        >
          {(events) => (
            <section className={styles.calendarCard}>
              <EventCalendar events={events} range={range} />
            </section>
          )}
        </QueryState>
      </Layout>
      <Navbar />
    </>
  );
}
