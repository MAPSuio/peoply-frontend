import GridCompactIcon from "../svgs/GridCompactIcon";
import GridLargeIcon from "../svgs/GridLargeIcon";

import styles from "../../styles/EventsPage.module.scss";

export interface GridSizeToggleProps {
  isCompactGrid: boolean;
  onChange: (isCompactGrid: boolean) => void;
}

export default function GridSizeToggle({
  isCompactGrid,
  onChange,
}: GridSizeToggleProps) {
  return (
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
          onClick={() => onChange(false)}
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
          onClick={() => onChange(true)}
        >
          <GridCompactIcon className={styles.gridSizeIcon} />
        </button>
      </div>
    </div>
  );
}
