import type { FilterPanelState } from "../../hooks/events/useEventFilters";

import styles from "../../styles/EventsPage.module.scss";

export interface FilterPanelCopy {
  inputId: string;
  toggleLabel: string;
  label: string;
  searchPlaceholder: string;
  noMatchesText: string;
}

export interface FilterOptionPanelProps {
  copy: FilterPanelCopy;
  panel: FilterPanelState;
}

export default function FilterOptionPanel({
  copy,
  panel,
}: FilterOptionPanelProps) {
  return (
    <div className={styles.optionList}>
      <div className={styles.filterPanelHeader}>
        <label className={styles.filterLabel} htmlFor={copy.inputId}>
          {copy.label}
        </label>
        <span className={styles.panelMeta}>{panel.selectedCount} valgt</span>
      </div>
      <input
        id={copy.inputId}
        className={styles.searchInput}
        type="text"
        value={panel.search}
        onChange={(event) => panel.onSearchChange(event.target.value)}
        placeholder={copy.searchPlaceholder}
      />
      <div className={styles.optionTags}>
        {panel.options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.optionButton} ${
              panel.isSelected(option.value) ? styles.optionButtonSelected : ""
            }`}
            onClick={() => panel.onToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
        {panel.options.length === 0 && (
          <p className={styles.noOptionsText}>{copy.noMatchesText}</p>
        )}
      </div>
    </div>
  );
}
