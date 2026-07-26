import type { ReactElement } from "react";
import styles from "../styles/TabSelection.module.scss";

interface TabSelectionProps {
  options: { label: string; value: string; icon?: ReactElement }[];
  selected: string;
  setSelected: (value: any) => void;
}

const TabSelection = ({
  options,
  selected,
  setSelected,
}: TabSelectionProps) => {
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
