// Components.
import SmallCheckCircle from "../components/SmallCheckCircle";

// Styles.
import styles from "../styles/RadioButton.module.scss";

interface RadioButtonProps {
  id: number;
  text: string;
  Icon: React.FunctionComponent;
  selected?: boolean;
  hintText?: string;
  onClick: (id: any) => void;
  card?: boolean;
}

const RadioButton = ({
  id,
  text,
  Icon,
  selected,
  hintText,
  onClick,
  card,
}: RadioButtonProps) => {
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
      <button className={radioButtonStyles} onClick={() => onClick(id)}>
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
