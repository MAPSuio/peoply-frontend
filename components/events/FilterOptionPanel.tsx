import type { FilterOption } from "../../utils/filterOptions";
import styles from "../../styles/EventsPage.module.scss";

export interface FilterPanelCopy {
  inputId: string;
  label: string;
  searchPlaceholder: string;
  noMatchesText: string;
}

interface FilterOptionPanelProps<T> {
  copy: FilterPanelCopy;
  options: FilterOption<T>[];
  selectedCount: number;
  search: string;
  onSearchChange: (search: string) => void;
  isSelected: (value: T) => boolean;
  onToggle: (value: T) => void;
}

export default function FilterOptionPanel<T extends string | number>({
  copy,
  options,
  selectedCount,
  search,
  onSearchChange,
  isSelected,
  onToggle,
}: FilterOptionPanelProps<T>) {
  return (
    <div className={styles.optionList}>
      <div className={styles.filterPanelHeader}>
        <label className={styles.filterLabel} htmlFor={copy.inputId}>
          {copy.label}
        </label>
        <span className={styles.panelMeta}>{selectedCount} valgt</span>
      </div>
      <input
        id={copy.inputId}
        className={styles.searchInput}
        type="text"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={copy.searchPlaceholder}
      />
      <div className={styles.optionTags}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`${styles.optionButton} ${
              isSelected(option.value) ? styles.optionButtonSelected : ""
            }`}
            onClick={() => onToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
        {options.length === 0 && (
          <p className={styles.noOptionsText}>{copy.noMatchesText}</p>
        )}
      </div>
    </div>
  );
}
