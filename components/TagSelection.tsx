import type { SelectionProps } from "../types/selection";
import ScrollRow from "./ScrollRow";
import styles from "../styles/TagSelection.module.scss";
import Tag from "./Tag";

/* Scrolled by the browser rather than by Swiper; see components/ScrollRow.tsx
   for why that matters on a phone. */
const TagSelection = <T extends string>({
  options,
  selected,
  setSelected,
}: SelectionProps<T>) => {
  return (
    <ScrollRow className={styles.row}>
      {options.map(({ label: optionLabel, value }) => (
        <div key={value} className={styles.tagSlide}>
          <Tag
            text={optionLabel}
            active={value === selected}
            onClick={() => setSelected(value)}
          />
        </div>
      ))}
    </ScrollRow>
  );
};

export default TagSelection;
