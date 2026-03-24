import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import useSWR from "swr";

import BackButton from "../../components/BackButton";
import Dropdown from "../../components/Dropdown";
import HeadComponent from "../../components/HeadComponent";
import LargeEventCard from "../../components/LargeEventCard";
import Layout from "../../components/Layout";
import useBack from "../../hooks/useBack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { Alignment, Event } from "../../types/types";
import { queryToString } from "../../utils/functions";

import styles from "../../styles/EventsPage.module.scss";

interface EventMonthGroup {
  key: string;
  label: string;
  events: Event[];
}

const MAX_EVENTS = 500;

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

const Events: NextPage = () => {
  const router = useRouter();
  const goBack = useBack();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("all");

  const eventsQuery = useMemo(() => {
    const now = new Date();
    const oneYearAhead = new Date(now);
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

    return {
      ...router.query,
      afterDate:
        typeof router.query.afterDate === "string"
          ? router.query.afterDate
          : now.toISOString(),
      beforeDate:
        typeof router.query.beforeDate === "string"
          ? router.query.beforeDate
          : oneYearAhead.toISOString(),
      orderBy:
        typeof router.query.orderBy === "string"
          ? router.query.orderBy
          : "startDate",
      orderDirection:
        typeof router.query.orderDirection === "string"
          ? router.query.orderDirection
          : "asc",
      take:
        typeof router.query.take === "string"
          ? router.query.take
          : `${MAX_EVENTS}`,
    };
  }, [router.query]);

  const queryUrl = useMemo(
    () => `/events?${queryToString(eventsQuery)}`,
    [eventsQuery],
  );

  const { data: events, error } = useSWR<Event[]>(
    queryUrl,
    fetchFromPeoplyApiJson,
  );

  const organizationOptions = useMemo(() => {
    const mappedOrganizations = (events ?? [])
      .flatMap((event) => event.eventArrangers ?? [])
      .map((eventArranger) => eventArranger.arranger.organization)
      .filter(
        (organization): organization is NonNullable<typeof organization> =>
          Boolean(organization),
      );

    const uniqueOrganizations = mappedOrganizations.reduce<
      { value: string; label: string }[]
    >((allOrganizations, organization) => {
      if (
        allOrganizations.some(
          (existingOrganization) =>
            existingOrganization.value === organization.id,
        )
      ) {
        return allOrganizations;
      }

      return [
        ...allOrganizations,
        {
          value: organization.id,
          label: organization.name,
        },
      ];
    }, []);

    return [
      { value: "all", label: "Alle foreninger" },
      ...uniqueOrganizations.sort((a, b) =>
        a.label.localeCompare(b.label, "nb-NO"),
      ),
    ];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return (events ?? []).filter((event) => {
      if (selectedOrganizationId === "all") {
        return true;
      }

      return (event.eventArrangers ?? []).some(
        (eventArranger) =>
          eventArranger.arranger.organization?.id === selectedOrganizationId,
      );
    });
  }, [events, selectedOrganizationId]);

  const eventsByMonth = useMemo(() => {
    return filteredEvents.reduce<EventMonthGroup[]>((groupedEvents, event) => {
      const startDate = new Date(event.startDate);
      const key = `${startDate.getFullYear()}-${startDate.getMonth()}`;
      const label = capitalize(
        startDate.toLocaleString("nb-NO", {
          month: "long",
          year: "numeric",
        }),
      );

      const existingGroup = groupedEvents.find((group) => group.key === key);
      if (existingGroup) {
        existingGroup.events.push(event);
        return groupedEvents;
      }

      return [...groupedEvents, { key, label, events: [event] }];
    }, []);
  }, [filteredEvents]);

  return (
    <>
      <HeadComponent
        title="Arrangementer"
        description="Utforsk arrangementer sortert etter måned"
        url={`${process.env.NEXT_PUBLIC_BASE_URL}${router.asPath}`}
      />
      <BackButton onClick={goBack} style={{ marginLeft: "5%" }} />
      <Layout align={Alignment.CENTER}>
        <div className={styles.headerContainer}>
          <h1>Arrangementer</h1>
          <p>
            Se kommende arrangementer organisert per måned, opptil ett år frem i
            tid.
          </p>
        </div>

        {organizationOptions.length > 1 && (
          <div className={styles.filterCard}>
            <div className={styles.filterCopy}>
              <h2>Filtrer på forening</h2>
              <p>Velg en forening for å se bare arrangementene deres.</p>
            </div>
            <Dropdown
              inputId="organizationFilter"
              label="Forening"
              options={organizationOptions}
              value={selectedOrganizationId}
              setValue={setSelectedOrganizationId}
              className={styles.filterDropdown}
              card
            />
          </div>
        )}

        {!error && !events && (
          <div className={styles.emptyState}>
            <h2>Laster arrangementer...</h2>
            <p>Henter kommende arrangementer for det neste året.</p>
          </div>
        )}

        {error && (
          <div className={styles.emptyState}>
            <h2>Kunne ikke laste arrangementer</h2>
            <p>Prøv igjen om litt.</p>
          </div>
        )}

        {!error && events && eventsByMonth.length === 0 && (
          <div className={styles.emptyState}>
            <h2>Ingen arrangementer funnet</h2>
            <p>Prøv en annen forening eller kom tilbake senere.</p>
          </div>
        )}

        <div className={styles.monthSections}>
          {eventsByMonth.map((group) => (
            <section key={group.key} className={styles.monthSection}>
              <div className={styles.monthHeader}>
                <h2>{group.label}</h2>
                <p>{group.events.length} arrangementer</p>
              </div>
              <div className={styles.eventGrid}>
                {group.events.map((event) => (
                  <LargeEventCard key={event.id} event={event} showArranger />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Layout>
    </>
  );
};

export default Events;
