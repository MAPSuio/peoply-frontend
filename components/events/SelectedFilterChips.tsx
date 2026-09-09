import type { FilterValue } from "../../hooks/events/useEventFilters";
import type { FilterOption } from "../../utils/filterOptions";

import styles from "../../styles/EventsPage.module.scss";

export interface SelectedFilterChipsProps {
  keyPrefix: string;
  options: FilterOption<FilterValue>[];
  onToggle: (value: FilterValue) => void;
}

export default function SelectedFilterChips({
  keyPrefix,
  options,
  onToggle,
}: SelectedFilterChipsProps) {
  return (
    <>
      {options.map((option) => (
        <button
          key={`${keyPrefix}-${option.value}`}
          type="button"
          className={`${styles.optionButton} ${styles.optionButtonSelected}`}
          onClick={() => onToggle(option.value)}
        >
          {option.label}
        </button>
      ))}
    </>
  );
}
