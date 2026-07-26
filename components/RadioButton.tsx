// Components.
import SmallCheckCircle from "../components/SmallCheckCircle";

// Styles.
import styles from "../styles/RadioButton.module.scss";

interface RadioButtonProps<T> {
  id: T;
  text: string;
  Icon: React.FunctionComponent;
  selected?: boolean;
  hintText?: string;
  onClick: (id: T) => void;
  card?: boolean;
}

const RadioButton = <T,>({
  id,
  text,
  Icon,
  selected,
  hintText,
  onClick,
  card,
}: RadioButtonProps<T>) => {
  const getRadioButtonStyles = () => {
    return selected
      ? `${styles.buttonContainer} ${styles.selected} ${card && styles.card}`
      : `${styles.buttonContainer} ${card && styles.card}`;
  };

  const getHintTextStyles = () => {
    return selected ? `${styles.hintText} ${styles.emphasis}` : styles.hintText;
  };
  const radioButtonStyles = getRadioButtonStyles();
  const hintTextStyles = getHintTextStyles();

  return (
    <div className={styles.buttonWrapper}>
      <button
        type="button"
        className={radioButtonStyles}
        onClick={() => onClick(id)}
      >
        <Icon />
        <p className={styles.radioButtonText}>{text}</p>
        {selected && (
          <SmallCheckCircle placeBottomCenter className={styles.checkIcon} />
        )}
      </button>
      {hintText && <p className={hintTextStyles}>{hintText}</p>}
    </div>
  );
};

export default RadioButton;
