import type {
  EventFilters,
  FilterPanelId,
} from "../../hooks/events/useEventFilters";
import SearchIcon from "../svgs/SearchIcon";
import FilterOptionPanel, { type FilterPanelCopy } from "./FilterOptionPanel";
import FilterToggleButton from "./FilterToggleButton";
import SelectedFilterChips from "./SelectedFilterChips";

import styles from "../../styles/EventsPage.module.scss";

const PANEL_COPY: Record<FilterPanelId, FilterPanelCopy> = {
  organizations: {
    inputId: "organizationFilter",
    toggleLabel: "Forening",
    label: "Foreninger",
    searchPlaceholder: "Søk etter forening",
    noMatchesText: "Ingen foreninger matcher søket.",
  },
  categories: {
    inputId: "categoryFilter",
    toggleLabel: "Type",
    label: "Arrangementstype",
    searchPlaceholder: "Søk etter type",
    noMatchesText: "Ingen typer matcher søket.",
  },
};

export interface EventFilterCardProps {
  filters: EventFilters;
  resultCount: number;
}

export default function EventFilterCard({
  filters,
  resultCount,
}: EventFilterCardProps) {
  const openPanel = filters.panels.find(
    (panel) => panel.id === filters.openPanelId,
  );
  const selectedChipCount = filters.panels.reduce(
    (total, panel) => total + panel.selected.length,
    0,
  );

  return (
    <div className={styles.filterCard}>
      <div className={styles.searchField}>
        <SearchIcon className={styles.searchIcon} />
        <input
          id="eventSearch"
          type="text"
          value={filters.eventSearch}
          onChange={(event) => filters.setEventSearch(event.target.value)}
          placeholder="Søk på navn, type eller arrangør"
          aria-label="Søk i arrangementer"
        />
      </div>
      <div className={styles.filterToolbar}>
        <div className={styles.filterToggleRow}>
          {filters.panels
            .filter((panel) => panel.hasOptions)
            .map((panel) => (
              <FilterToggleButton
                key={panel.id}
                label={PANEL_COPY[panel.id].toggleLabel}
                selectedCount={panel.selectedCount}
                expanded={filters.openPanelId === panel.id}
                onClick={() => filters.togglePanel(panel.id)}
              />
            ))}
          {filters.hasActiveFilters && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={filters.clearFilters}
            >
              Nullstill
            </button>
          )}
        </div>
        <p className={styles.resultsText}>{resultCount} treff</p>
      </div>

      {selectedChipCount > 0 && (
        <div className={styles.selectedFilters}>
          {filters.panels.map((panel) => (
            <SelectedFilterChips
              key={panel.id}
              keyPrefix={panel.id}
              options={panel.selected}
              onToggle={panel.onToggle}
            />
          ))}
        </div>
      )}

      {openPanel && (
        <FilterOptionPanel copy={PANEL_COPY[openPanel.id]} panel={openPanel} />
      )}
    </div>
  );
}
