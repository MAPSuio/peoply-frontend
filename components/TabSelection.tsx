import type { ReactElement } from "react";
import styles from "../styles/TabSelection.module.scss";

interface TabSelectionProps<T extends string> {
  options: { label: string; value: T; icon?: ReactElement }[];
  selected: T;
  setSelected: (value: T) => void;
}

const TabSelection = <T extends string>({
  options,
  selected,
  setSelected,
}: TabSelectionProps<T>) => {
  return (
    <div className={styles.container}>
      {options.map(({ label, value, icon }) => {
        return (
          <button
            type="button"
            className={`${styles.tab} ${
              selected === value ? styles.selected : ""
            }
        }`}
            key={value}
            onClick={() => setSelected(value)}
          >
            {icon && icon}
            <span>{label}</span>
            <span className={styles.activeLine}></span>
          </button>
        );
      })}
    </div>
  );
};

export default TabSelection;
