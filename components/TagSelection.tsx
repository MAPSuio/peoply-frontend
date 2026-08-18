import ScrollRow from "./ScrollRow";
import styles from "../styles/TagSelection.module.scss";
import Tag from "./Tag";

interface TagSelectionProps<T extends string> {
  options: {
    label: string;
    value: T;
  }[];
  selected: T;
  setSelected: (value: T) => void;
}

/* Scrolled by the browser rather than by Swiper; see components/ScrollRow.tsx
   for why that matters on a phone. */
const TagSelection = <T extends string>({
  options,
  selected,
  setSelected,
}: TagSelectionProps<T>) => {
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
