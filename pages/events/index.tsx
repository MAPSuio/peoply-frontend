import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import LargeEventCard from "../../components/LargeEventCard";
import Layout from "../../components/Layout";
import QueryState from "../../components/QueryState";
import GridCompactIcon from "../../components/svgs/GridCompactIcon";
import GridLargeIcon from "../../components/svgs/GridLargeIcon";
import SearchIcon from "../../components/svgs/SearchIcon";
import useBack from "../../hooks/useBack";
import {
  MAX_PAGE_SIZE,
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../../services/fetchers";
import {
  Alignment,
  type Category,
  type Event,
  type Organization,
} from "../../types/types";
import { getEventArrangerDisplayItems } from "../../utils/eventArrangers";
import { queryToString } from "../../utils/functions";

import styles from "../../styles/EventsPage.module.scss";

interface EventMonthGroup {
  key: string;
  label: string;
  events: Event[];
}

interface FilterOption<T> {
  value: T;
  label: string;
}

const COMPACT_GRID_STORAGE_KEY = "eventsCompactGrid";

type FilterPanel = "organizations" | "categories";

function capitalize(value: string) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeSearchValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

const Events: NextPage = () => {
  const router = useRouter();
  const goBack = useBack();
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<
    string[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [isCompactGrid, setIsCompactGrid] = useState(false);
  const [compactPreferenceLoaded, setCompactPreferenceLoaded] = useState(false);
  const [openFilterPanel, setOpenFilterPanel] = useState<FilterPanel | null>(
    null,
  );
  const deferredEventSearch = useDeferredValue(eventSearch);

  // A ?take= in the URL is a deliberate cap on the result; without one the page
  // wants every event in the range, which means paging through the API.
  const explicitTake =
    typeof router.query.take === "string" ? router.query.take : undefined;

  const eventsQuery = useMemo(() => {
    const now = new Date();
    const oneYearAhead = new Date(now);
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

    // take is re-added below (or supplied per page by the fetcher).
    const query = { ...router.query };
    delete query.take;

    return {
      ...query,
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
      // The API rejects anything above MAX_PAGE_SIZE outright, so clamp
      // rather than letting a hand-written URL turn into a 400.
      ...(explicitTake
        ? {
            take: `${Math.min(
              Number(explicitTake) || MAX_PAGE_SIZE,
              MAX_PAGE_SIZE,
            )}`,
          }
        : {}),
    };
  }, [explicitTake, router.query]);

  const queryUrl = useMemo(
    () => `/events?${queryToString(eventsQuery)}`,
    [eventsQuery],
  );
  const organizationsQueryUrl = "/organizations?orderBy=name";

  const eventsResult = useSWR<Event[]>(
    queryUrl,
    explicitTake ? fetchFromPeoplyApiJson : fetchAllFromPeoplyApiJson,
  );
  const { data: organizations } = useSWR<Organization[]>(
    organizationsQueryUrl,
    fetchAllFromPeoplyApiJson,
  );
  const { data: categories } = useSWR<Category[]>("/categories");

  const organizationOptions = useMemo(() => {
    const uniqueOrganizations = (organizations ?? []).reduce<
      FilterOption<string>[]
    >((allOrganizations, organization) => {
      if (
        allOrganizations.some((existing) => existing.value === organization.id)
      ) {
        return allOrganizations;
      }

      allOrganizations.push({
        value: organization.id,
        label: organization.name,
      });
      return allOrganizations;
    }, []);

    return uniqueOrganizations.sort((a, b) =>
      a.label.localeCompare(b.label, "nb-NO"),
    );
  }, [organizations]);

  const categoryOptions = useMemo(() => {
    const uniqueCategories = (categories ?? []).reduce<FilterOption<number>[]>(
      (allCategories, category) => {
        if (allCategories.some((existing) => existing.value === category.id)) {
          return allCategories;
        }

        allCategories.push({ value: category.id, label: category.name });
        return allCategories;
      },
      [],
    );

    return uniqueCategories.sort((a, b) =>
      a.label.localeCompare(b.label, "nb-NO"),
    );
  }, [categories]);

  const visibleOrganizationOptions = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(organizationSearch);

    if (!normalizedSearch) {
      return organizationOptions;
    }

    return organizationOptions.filter((organization) =>
      normalizeSearchValue(organization.label).includes(normalizedSearch),
    );
  }, [organizationOptions, organizationSearch]);

  const visibleCategoryOptions = useMemo(() => {
    const normalizedSearch = normalizeSearchValue(categorySearch);

    if (!normalizedSearch) {
      return categoryOptions;
    }

    return categoryOptions.filter((category) =>
      normalizeSearchValue(category.label).includes(normalizedSearch),
    );
  }, [categoryOptions, categorySearch]);

  const selectedOrganizations = useMemo(
    () =>
      organizationOptions.filter((organization) =>
        selectedOrganizationIds.includes(organization.value),
      ),
    [organizationOptions, selectedOrganizationIds],
  );

  const selectedCategories = useMemo(
    () =>
      categoryOptions.filter((category) =>
        selectedCategoryIds.includes(category.value),
      ),
    [categoryOptions, selectedCategoryIds],
  );

  const filteredEvents = useMemo(() => {
    const searchTerms = normalizeSearchValue(deferredEventSearch)
      .split(/\s+/)
      .filter(Boolean);

    return (eventsResult.data ?? []).filter((event) => {
      const matchesOrganization =
        selectedOrganizationIds.length === 0 ||
        (event.eventArrangers ?? []).some((eventArranger) =>
          selectedOrganizationIds.includes(
            eventArranger.arranger.organization?.id ?? "",
          ),
        );

      const matchesCategory =
        selectedCategoryIds.length === 0 ||
        (event.eventCategories ?? []).some((eventCategory) =>
          selectedCategoryIds.includes(eventCategory.categoryId),
        );

      if (!matchesOrganization || !matchesCategory) {
        return false;
      }

      if (searchTerms.length === 0) {
        return true;
      }

      const searchableContent = normalizeSearchValue(
        [
          event.title,
          ...getEventArrangerDisplayItems(event).map((item) => item.label),
          ...(event.eventCategories ?? []).map(
            (eventCategory) => eventCategory.category?.name ?? "",
          ),
        ].join(" "),
      );

      return searchTerms.every((term) => searchableContent.includes(term));
    });
  }, [
    deferredEventSearch,
    eventsResult.data,
    selectedCategoryIds,
    selectedOrganizationIds,
  ]);

  const hasActiveFilters =
    eventSearch.trim().length > 0 ||
    selectedOrganizationIds.length > 0 ||
    selectedCategoryIds.length > 0;

  const toggleOrganization = (organizationId: string) => {
    setSelectedOrganizationIds((currentOrganizationIds) =>
      currentOrganizationIds.includes(organizationId)
        ? currentOrganizationIds.filter((id) => id !== organizationId)
        : [...currentOrganizationIds, organizationId],
    );
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((currentCategoryIds) =>
      currentCategoryIds.includes(categoryId)
        ? currentCategoryIds.filter((id) => id !== categoryId)
        : [...currentCategoryIds, categoryId],
    );
  };

  const toggleFilterPanel = (panel: FilterPanel) => {
    setOpenFilterPanel((currentPanel) =>
      currentPanel === panel ? null : panel,
    );
  };

  const clearFilters = () => {
    setEventSearch("");
    setOrganizationSearch("");
    setCategorySearch("");
    setSelectedOrganizationIds([]);
    setSelectedCategoryIds([]);
    setOpenFilterPanel(null);
  };

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(
      COMPACT_GRID_STORAGE_KEY,
    );

    if (storedPreference === "true") {
      setIsCompactGrid(true);
    }

    setCompactPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!compactPreferenceLoaded) {
      return;
    }

    window.localStorage.setItem(
      COMPACT_GRID_STORAGE_KEY,
      String(isCompactGrid),
    );
  }, [compactPreferenceLoaded, isCompactGrid]);

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

      groupedEvents.push({ key, label, events: [event] });
      return groupedEvents;
    }, []);
  }, [filteredEvents]);

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

        <div className={styles.filterCard}>
          <div className={styles.searchField}>
            <SearchIcon className={styles.searchIcon} />
            <input
              id="eventSearch"
              type="text"
              value={eventSearch}
              onChange={(event) => setEventSearch(event.target.value)}
              placeholder="Søk på navn, type eller arrangør"
              aria-label="Søk i arrangementer"
            />
          </div>
          <div className={styles.filterToolbar}>
            <div className={styles.filterToggleRow}>
              {organizationOptions.length > 0 && (
                <button
                  type="button"
                  className={`${styles.filterToggleButton} ${
                    openFilterPanel === "organizations"
                      ? styles.filterToggleButtonActive
                      : ""
                  }`}
                  onClick={() => toggleFilterPanel("organizations")}
                  aria-expanded={openFilterPanel === "organizations"}
                >
                  Forening
                  {selectedOrganizationIds.length > 0 && (
                    <span> ({selectedOrganizationIds.length})</span>
                  )}
                </button>
              )}
              {categoryOptions.length > 0 && (
                <button
                  type="button"
                  className={`${styles.filterToggleButton} ${
                    openFilterPanel === "categories"
                      ? styles.filterToggleButtonActive
                      : ""
                  }`}
                  onClick={() => toggleFilterPanel("categories")}
                  aria-expanded={openFilterPanel === "categories"}
                >
                  Type
                  {selectedCategoryIds.length > 0 && (
                    <span> ({selectedCategoryIds.length})</span>
                  )}
                </button>
              )}
              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.clearButton}
                  onClick={clearFilters}
                >
                  Nullstill
                </button>
              )}
            </div>
            <p className={styles.resultsText}>{filteredEvents.length} treff</p>
          </div>

          {(selectedOrganizations.length > 0 ||
            selectedCategories.length > 0) && (
            <div className={styles.selectedFilters}>
              {selectedOrganizations.map((organization) => (
                <button
                  key={`org-${organization.value}`}
                  type="button"
                  className={`${styles.optionButton} ${styles.optionButtonSelected}`}
                  onClick={() => toggleOrganization(organization.value)}
                >
                  {organization.label}
                </button>
              ))}
              {selectedCategories.map((category) => (
                <button
                  key={`cat-${category.value}`}
                  type="button"
                  className={`${styles.optionButton} ${styles.optionButtonSelected}`}
                  onClick={() => toggleCategory(category.value)}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {openFilterPanel === "organizations" && (
            <div className={styles.optionList}>
              <div className={styles.filterPanelHeader}>
                <label
                  className={styles.filterLabel}
                  htmlFor="organizationFilter"
                >
                  Foreninger
                </label>
                <span className={styles.panelMeta}>
                  {selectedOrganizationIds.length} valgt
                </span>
              </div>
              <input
                id="organizationFilter"
                className={styles.searchInput}
                type="text"
                value={organizationSearch}
                onChange={(event) => setOrganizationSearch(event.target.value)}
                placeholder="Søk etter forening"
              />
              <div className={styles.optionTags}>
                {visibleOrganizationOptions.map((organization) => {
                  const isSelected = selectedOrganizationIds.includes(
                    organization.value,
                  );

                  return (
                    <button
                      key={organization.value}
                      type="button"
                      className={`${styles.optionButton} ${
                        isSelected ? styles.optionButtonSelected : ""
                      }`}
                      onClick={() => toggleOrganization(organization.value)}
                    >
                      {organization.label}
                    </button>
                  );
                })}
                {visibleOrganizationOptions.length === 0 && (
                  <p className={styles.noOptionsText}>
                    Ingen foreninger matcher søket.
                  </p>
                )}
              </div>
            </div>
          )}

          {openFilterPanel === "categories" && (
            <div className={styles.optionList}>
              <div className={styles.filterPanelHeader}>
                <label className={styles.filterLabel} htmlFor="categoryFilter">
                  Arrangementstype
                </label>
                <span className={styles.panelMeta}>
                  {selectedCategoryIds.length} valgt
                </span>
              </div>
              <input
                id="categoryFilter"
                className={styles.searchInput}
                type="text"
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="Søk etter type"
              />
              <div className={styles.optionTags}>
                {visibleCategoryOptions.map((category) => {
                  const isSelected = selectedCategoryIds.includes(
                    category.value,
                  );

                  return (
                    <button
                      key={category.value}
                      type="button"
                      className={`${styles.optionButton} ${
                        isSelected ? styles.optionButtonSelected : ""
                      }`}
                      onClick={() => toggleCategory(category.value)}
                    >
                      {category.label}
                    </button>
                  );
                })}
                {visibleCategoryOptions.length === 0 && (
                  <p className={styles.noOptionsText}>
                    Ingen typer matcher søket.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.gridToggleBar}>
          <div className={styles.gridSizeControl}>
            <span
              className={`${styles.gridSizeThumb} ${
                isCompactGrid ? styles.gridSizeThumbCompact : ""
              }`}
              aria-hidden="true"
            />
            <button
              type="button"
              className={`${styles.gridSizeOption} ${
                !isCompactGrid ? styles.gridSizeOptionActive : ""
              }`}
              aria-pressed={!isCompactGrid}
              aria-label="Stor visning"
              title="Stor visning"
              onClick={() => setIsCompactGrid(false)}
            >
              <GridLargeIcon className={styles.gridSizeIcon} />
            </button>
            <button
              type="button"
              className={`${styles.gridSizeOption} ${
                isCompactGrid ? styles.gridSizeOptionActive : ""
              }`}
              aria-pressed={isCompactGrid}
              aria-label="Kompakt visning"
              title="Kompakt visning"
              onClick={() => setIsCompactGrid(true)}
            >
              <GridCompactIcon className={styles.gridSizeIcon} />
            </button>
          </div>
        </div>

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
                  {hasActiveFilters
                    ? "Prøv å justere filtrene eller søket."
                    : "Kom tilbake senere for flere arrangementer."}
                </p>
              </div>
            ) : (
              <div className={styles.monthSections}>
                {eventsByMonth.map((group) => (
                  <section key={group.key} className={styles.monthSection}>
                    <div className={styles.monthHeader}>
                      <h2>{group.label}</h2>
                      <p>{group.events.length} arrangementer</p>
                    </div>
                    <div
                      className={`${styles.eventGrid} ${
                        isCompactGrid ? styles.eventGridCompact : ""
                      }`}
                    >
                      {group.events.map((event) => (
                        <LargeEventCard
                          key={event.id}
                          event={event}
                          showArranger
                          compact={isCompactGrid}
                          stackActionsOnDesktop={isCompactGrid}
                          className={styles.eventCard}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )
          }
        </QueryState>
      </Layout>
    </>
  );
};

export default Events;
