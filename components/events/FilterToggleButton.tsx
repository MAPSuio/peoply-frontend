import styles from "../../styles/EventsPage.module.scss";

export interface FilterToggleButtonProps {
  label: string;
  selectedCount: number;
  expanded: boolean;
  onClick: () => void;
}

export default function FilterToggleButton({
  label,
  selectedCount,
  expanded,
  onClick,
}: FilterToggleButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.filterToggleButton} ${
        expanded ? styles.filterToggleButtonActive : ""
      }`}
      onClick={onClick}
      aria-expanded={expanded}
    >
      {label}
      {selectedCount > 0 && <span> ({selectedCount})</span>}
    </button>
  );
}
