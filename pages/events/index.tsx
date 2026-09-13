import type { NextPage } from "next";
import { useMemo } from "react";
import useSWR from "swr";

import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import Layout from "../../components/Layout";
import QueryState from "../../components/QueryState";
import EventFilterCard from "../../components/events/EventFilterCard";
import EventMonthSections from "../../components/events/EventMonthSections";
import GridSizeToggle from "../../components/events/GridSizeToggle";
import useBack from "../../hooks/useBack";
import useCompactGridPreference from "../../hooks/events/useCompactGridPreference";
import useEventFilters from "../../hooks/events/useEventFilters";
import useEventsQuery from "../../hooks/events/useEventsQuery";
import { fetchAllFromPeoplyApiJson } from "../../services/fetchers";
import { Alignment, type Category, type Organization } from "../../types/types";
import { filterEvents, groupEventsByMonth } from "../../utils/eventListing";

import styles from "../../styles/EventsPage.module.scss";

const Events: NextPage = () => {
  const goBack = useBack();
  const eventsResult = useEventsQuery();
  const { data: organizations } = useSWR<Organization[]>(
    "/organizations?orderBy=name",
    fetchAllFromPeoplyApiJson,
  );
  const { data: categories } = useSWR<Category[]>("/categories");

  const filters = useEventFilters(organizations, categories);
  const [isCompactGrid, setIsCompactGrid] = useCompactGridPreference();

  const eventsByMonth = useMemo(
    () =>
      groupEventsByMonth(
        filterEvents(eventsResult.data ?? [], filters.criteria),
      ),
    [eventsResult.data, filters.criteria],
  );

  const resultCount = eventsByMonth.reduce(
    (total, group) => total + group.events.length,
    0,
  );

  return (
    <>
      <HeadComponent
        title="Arrangementer"
        description="Utforsk arrangementer sortert etter måned"
      />
      <BackButton onClick={goBack} style={{ marginLeft: "5%" }} />
      <Layout align={Alignment.CENTER}>
        <div className={styles.headerContainer}>
          <h1>Arrangementer</h1>
          <p>Se kommende arrangementer opptil ett år frem i tid.</p>
        </div>

        <EventFilterCard filters={filters} resultCount={resultCount} />

        <GridSizeToggle
          isCompactGrid={isCompactGrid}
          onChange={setIsCompactGrid}
        />

        <QueryState
          query={eventsResult}
          errorMessage="Kunne ikke laste arrangementer. Prøv igjen om litt."
          className={styles.emptyState}
        >
          {() =>
            eventsByMonth.length === 0 ? (
              <div className={styles.emptyState}>
                <h2>Ingen arrangementer funnet</h2>
                <p>
                  {filters.hasActiveFilters
                    ? "Prøv å justere filtrene eller søket."
                    : "Kom tilbake senere for flere arrangementer."}
                </p>
              </div>
            ) : (
              <EventMonthSections
                groups={eventsByMonth}
                isCompactGrid={isCompactGrid}
              />
            )
          }
        </QueryState>
      </Layout>
    </>
  );
};

export default Events;
