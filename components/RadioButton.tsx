import styles from "../styles/RadioButton.module.scss";

import SmallCheckCircle from "../components/SmallCheckCircle";

interface RadioButtonProps {
  id: number;
  text: string;
  Icon: React.FunctionComponent;
  selected?: boolean;
  hintText?: string;
  onClick: (id: any) => void;
}

const RadioButton = ({
  id,
  text,
  Icon,
  selected,
  hintText,
  onClick,
}: RadioButtonProps) => {
  const getRadioButtonStyles = () => {
    return selected
      ? `${styles.buttonContainer} ${styles.selected}`
      : styles.buttonContainer;
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
        {selected && <SmallCheckCircle placeBottomCenter />}
      </button>
      {hintText && <p className={hintTextStyles}>{hintText}</p>}
    </div>
  );
};

export default RadioButton;
