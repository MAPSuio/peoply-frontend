import type { ReactElement } from "react";
import type { SelectionOption, SelectionProps } from "../types/selection";
import styles from "../styles/TabSelection.module.scss";

type TabOption<T extends string> = SelectionOption<T> & { icon?: ReactElement };

const TabSelection = <T extends string>({
  options,
  selected,
  setSelected,
}: SelectionProps<T, TabOption<T>>) => {
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
