import { useEffect, useState } from "react";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import styles from "../styles/GlobalSearch.module.scss";
import LoadingWheel from "./LoadingWheel";
import ResultItem from "./ResultItem";
import SearchIcon from "./svgs/SearchIcon";
import { Event, Organization } from "../types/types";
import Avatar from "./Avatar";
import { calculateEditDistance } from "../utils/functions";
import TagSwiperSelection from "./TagSwiperSelection";

enum FilterOption {
  ALL = "ALL",
  EVENTS = "EVENTS",
  ORGANIZATIONS = "ORGANIZATIONS",
}

export default function GlobalSearch({}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [queuedSearch, setQueuedSearch] =
    useState<ReturnType<typeof setTimeout>>();
  const [selectedFilter, setSelectedFilter] = useState(FilterOption.ALL);
  const [events, setEvents] = useState<Event[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  /* hook to fetch whenever search term changes */
  useEffect(() => {
    const performSearch = async () => {
      const [events, organizations] = await Promise.all([
        fetchFromPeoplyApiJson(`/events?title=${encodeURIComponent(search)}`, {
          method: "GET",
        }),
        fetchFromPeoplyApiJson(
          `/organizations?name=${encodeURIComponent(search)}`,
          {
            method: "GET",
          },
        ),
      ]);
      setEvents(events);
      setOrganizations(organizations);
      setLoading(false);
    };

    let req: ReturnType<typeof setTimeout>;
    if (search.length >= 3) {
      setLoading(true);
      req = setTimeout(() => performSearch(), 400);
      setQueuedSearch(req);
    }

    return () => {
      if (req) {
        clearTimeout(req);
      }
    };
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setEvents([]); // clear users when search term is changed
    setOrganizations([]); // clear users when search term is changed
    if (queuedSearch) {
      clearTimeout(queuedSearch);
    }

    if (query.length < 3) {
      setLoading(false);
    }
  };

  const eventCount = events.length;
  const organizationCount = organizations.length;
  const resultCount = eventCount + organizationCount;
  const hasResults = resultCount > 0;

  function renderResults() {
    const eventResults: (Event & { editDistance: number; type: "event" })[] =
      events.map((event) => ({
        ...event,
        editDistance: calculateEditDistance(event.title, search),
        type: "event",
      }));
    const organizationResults: (Organization & {
      editDistance: number;
      type: "org";
    })[] = organizations.map((organization) => ({
      ...organization,
      editDistance: calculateEditDistance(organization.name, search),
      type: "org",
    }));

    const sortedByEditDistance = [...eventResults, ...organizationResults].sort(
      (a, b) => a.editDistance - b.editDistance,
    );

    const toBeRendered = sortedByEditDistance.map((result) => {
      switch (result.type) {
        case "event":
          const event = result as Event;
          return {
            element: (
              <ResultItem
                key={event.id}
                title={event.title}
                description={"Arrangement"}
                link={`/events/${event.urlId}`}
              >
                <Avatar size="medium" event={event} />
              </ResultItem>
            ),
            type: "event",
          };
        case "org":
          const org = result as Organization;
          return {
            element: (
              <ResultItem
                key={org.id}
                title={org.name}
                description={"Organisasjon"}
                link={`/orgs/${org.id}`}
              >
                <Avatar size="medium" org={org} />
              </ResultItem>
            ),
            type: "org",
          };
      }
    });

    switch (selectedFilter) {
      case FilterOption.ALL:
        return toBeRendered.map(({ element }) => element);
      case FilterOption.EVENTS:
        return eventCount ? (
          toBeRendered
            .filter(({ type }) => type === "event")
            .map(({ element }) => element)
        ) : (
          <p className={styles.error}>Ingen arrangementer funnet...</p>
        );
      case FilterOption.ORGANIZATIONS:
        return organizationCount ? (
          toBeRendered
            .filter(({ type }) => type === "org")
            .map(({ element }) => element)
        ) : (
          <p className={styles.error}>Ingen organisasjoner funnet...</p>
        );
      default:
        return [];
    }
  }

  function convertFilterOptionToLabel(filter: FilterOption) {
    switch (filter) {
      case FilterOption.ALL:
        return "Alle";
      case FilterOption.EVENTS:
        return "Arrangement";
      case FilterOption.ORGANIZATIONS:
        return "Organisasjoner";
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div
          className={`${styles.inputContainer} ${
            focused ? styles.focused : ""
          }`}
        >
          {loading ? <LoadingWheel /> : <SearchIcon />}
          <input
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            type="text"
            value={search}
            onChange={handleChange}
          />
        </div>
      </div>
      {hasResults && (
        <div className={styles.results}>
          <div className={styles.header}>
            <TagSwiperSelection
              selected={selectedFilter}
              setSelected={setSelectedFilter}
              options={[
                {
                  label: `${convertFilterOptionToLabel(
                    FilterOption.ALL,
                  )} (${resultCount})`,
                  value: FilterOption.ALL,
                },
                {
                  label: `${convertFilterOptionToLabel(
                    FilterOption.EVENTS,
                  )} (${eventCount})`,
                  value: FilterOption.EVENTS,
                },
                {
                  label: `${convertFilterOptionToLabel(
                    FilterOption.ORGANIZATIONS,
                  )} (${organizationCount})`,
                  value: FilterOption.ORGANIZATIONS,
                },
              ]}
            />
          </div>
          <div className={styles.cards}> {renderResults()} </div>
        </div>
      )}
    </div>
  );
}
