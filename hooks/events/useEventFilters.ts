import {
  type Dispatch,
  type SetStateAction,
  useDeferredValue,
  useMemo,
  useState,
} from "react";

import type { Category, Organization } from "../../types/types";
import {
  type FilterOption,
  matchingOptions,
  sortedUniqueOptions,
} from "../../utils/filterOptions";

export type FilterPanelId = "organizations" | "categories";

export type FilterValue = string | number;

export interface FilterPanelState {
  id: FilterPanelId;
  options: FilterOption<FilterValue>[];
  selected: FilterOption<FilterValue>[];
  selectedCount: number;
  hasOptions: boolean;
  search: string;
  onSearchChange: (search: string) => void;
  isSelected: (value: FilterValue) => boolean;
  onToggle: (value: FilterValue) => void;
}

function toggled<Value>(values: Value[], value: Value): Value[] {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

function optionsOf(
  items: Array<{ id: FilterValue; name: string }> | undefined,
): FilterOption<FilterValue>[] {
  return sortedUniqueOptions(
    (items ?? []).map(({ id, name }) => ({ value: id, label: name })),
  );
}

function panelState<Value extends FilterValue>(
  id: FilterPanelId,
  options: FilterOption<FilterValue>[],
  search: string,
  setSearch: Dispatch<SetStateAction<string>>,
  selectedValues: Value[],
  setSelectedValues: Dispatch<SetStateAction<Value[]>>,
): FilterPanelState {
  const isSelected = (value: FilterValue) =>
    selectedValues.includes(value as Value);

  return {
    id,
    options: matchingOptions(options, search),
    selected: options.filter((option) => isSelected(option.value)),
    selectedCount: selectedValues.length,
    hasOptions: options.length > 0,
    search,
    onSearchChange: setSearch,
    isSelected,
    onToggle: (value) =>
      setSelectedValues((current) => toggled(current, value as Value)),
  };
}

export default function useEventFilters(
  organizations: Organization[] | undefined,
  categories: Category[] | undefined,
) {
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<
    string[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [eventSearch, setEventSearch] = useState("");
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [openPanelId, setOpenPanelId] = useState<FilterPanelId | null>(null);

  const organizationOptions = useMemo(
    () => optionsOf(organizations),
    [organizations],
  );
  const categoryOptions = useMemo(() => optionsOf(categories), [categories]);

  const panels: FilterPanelState[] = [
    panelState(
      "organizations",
      organizationOptions,
      organizationSearch,
      setOrganizationSearch,
      selectedOrganizationIds,
      setSelectedOrganizationIds,
    ),
    panelState(
      "categories",
      categoryOptions,
      categorySearch,
      setCategorySearch,
      selectedCategoryIds,
      setSelectedCategoryIds,
    ),
  ];

  return {
    criteria: {
      selectedOrganizationIds,
      selectedCategoryIds,
      search: useDeferredValue(eventSearch),
    },
    eventSearch,
    setEventSearch,
    panels,
    openPanelId,
    togglePanel: (id: FilterPanelId) =>
      setOpenPanelId((current) => (current === id ? null : id)),
    hasActiveFilters:
      eventSearch.trim().length > 0 ||
      selectedOrganizationIds.length > 0 ||
      selectedCategoryIds.length > 0,
    clearFilters: () => {
      setEventSearch("");
      setOrganizationSearch("");
      setCategorySearch("");
      setSelectedOrganizationIds([]);
      setSelectedCategoryIds([]);
      setOpenPanelId(null);
    },
  };
}

export type EventFilters = ReturnType<typeof useEventFilters>;
