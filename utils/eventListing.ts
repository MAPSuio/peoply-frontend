import { MAX_PAGE_SIZE } from "../services/fetchers";
import type { Event } from "../types/types";
import { getEventArrangerDisplayItems } from "./eventArrangers";
import { normalizeSearchValue } from "./filterOptions";

export interface EventMonthGroup {
  key: string;
  label: string;
  events: Event[];
}

export interface EventFilterCriteria {
  selectedOrganizationIds: string[];
  selectedCategoryIds: number[];
  search: string;
}

export type RouterQuery = Record<string, string | string[] | undefined>;

function stringOr(
  query: RouterQuery,
  key: string,
  fallback: string,
): string | undefined {
  const value = query[key];
  return typeof value === "string" ? value : fallback;
}

function clampedTake(query: RouterQuery): { take?: string } {
  const take = query.take;

  if (typeof take !== "string") {
    return {};
  }

  return { take: `${Math.min(Number(take) || MAX_PAGE_SIZE, MAX_PAGE_SIZE)}` };
}

export function buildEventsQuery(query: RouterQuery, now: Date) {
  const oneYearAhead = new Date(now);
  oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);

  const inherited = { ...query };
  delete inherited.take;

  return {
    ...inherited,
    afterDate: stringOr(query, "afterDate", now.toISOString()),
    beforeDate: stringOr(query, "beforeDate", oneYearAhead.toISOString()),
    orderBy: stringOr(query, "orderBy", "startDate"),
    orderDirection: stringOr(query, "orderDirection", "asc"),
    ...clampedTake(query),
  };
}

function arrangedByAnyOf(event: Event, organizationIds: string[]): boolean {
  return (event.eventArrangers ?? []).some((eventArranger) =>
    organizationIds.includes(eventArranger.arranger.organization?.id ?? ""),
  );
}

function categorisedAsAnyOf(event: Event, categoryIds: number[]): boolean {
  return (event.eventCategories ?? []).some((eventCategory) =>
    categoryIds.includes(eventCategory.categoryId),
  );
}

function searchableContentOf(event: Event): string {
  return normalizeSearchValue(
    [
      event.title,
      ...getEventArrangerDisplayItems(event).map((item) => item.label),
      ...(event.eventCategories ?? []).map(
        (eventCategory) => eventCategory.category?.name ?? "",
      ),
    ].join(" "),
  );
}

export function filterEvents(
  events: Event[],
  { selectedOrganizationIds, selectedCategoryIds, search }: EventFilterCriteria,
): Event[] {
  const searchTerms = normalizeSearchValue(search).split(/\s+/).filter(Boolean);

  return events.filter((event) => {
    if (
      selectedOrganizationIds.length > 0 &&
      !arrangedByAnyOf(event, selectedOrganizationIds)
    ) {
      return false;
    }

    if (
      selectedCategoryIds.length > 0 &&
      !categorisedAsAnyOf(event, selectedCategoryIds)
    ) {
      return false;
    }

    const searchableContent = searchableContentOf(event);
    return searchTerms.every((term) => searchableContent.includes(term));
  });
}

function monthLabel(startDate: Date): string {
  const label = startDate.toLocaleString("nb-NO", {
    month: "long",
    year: "numeric",
  });

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function groupEventsByMonth(events: Event[]): EventMonthGroup[] {
  const groupsByKey = new Map<string, EventMonthGroup>();

  for (const event of events) {
    const startDate = new Date(event.startDate);
    const key = `${startDate.getFullYear()}-${startDate.getMonth()}`;
    const group = groupsByKey.get(key);

    if (group) {
      group.events.push(event);
    } else {
      groupsByKey.set(key, {
        key,
        label: monthLabel(startDate),
        events: [event],
      });
    }
  }

  return [...groupsByKey.values()];
}
