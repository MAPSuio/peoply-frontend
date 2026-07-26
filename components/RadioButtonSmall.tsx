/* Assets. */
import SmallCheckCircle from "./SmallCheckCircle";

/* Styles. */
import styles from "../styles/RadioButtonSmall.module.scss";

interface RadioButtonSmallProps {
  id: number;
  text: string;
  Icon: React.FunctionComponent;
  selected?: boolean;
  hintText?: string;
  onClick: (id: number) => void;
}

const RadioButtonSmall = ({
  id,
  text,
  Icon,
  selected,
  hintText,
  onClick,
}: RadioButtonSmallProps) => {
  return (
    <div className={styles.buttonWrapper}>
      <button
        type="button"
        className={`${styles.buttonContainer} ${selected && styles.selected}`}
        onClick={() => onClick(id)}
      >
        <Icon />
        <p className={styles.radioButtonText}>{text}</p>
        {selected && (
          <SmallCheckCircle placeBottomCenter className={styles.checkIcon} />
        )}
      </button>
      {hintText && (
        <p className={`${styles.hintText} ${selected && styles.emphasis}`}>
          {hintText}
        </p>
      )}
    </div>
  );
};

export default RadioButtonSmall;
