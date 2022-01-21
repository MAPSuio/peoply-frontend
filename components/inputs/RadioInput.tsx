import RadioButton from "../RadioButton";

import styles from "../../styles/RadioInput.module.scss";

interface RadioInputInterface {
  optionsAndIcons: Array<{
    id: number;
    text: string;
    hintText: string;
    icon: React.FunctionComponent;
    active: boolean;
  }>;
  label: string;
  onClick: (id: number) => void;
}

const RadioInput = ({
  optionsAndIcons,
  label,
  onClick,
}: RadioInputInterface) => {
  return (
    <div className={styles.radioInputWrapper}>
      <p className={styles.labelText}>{label}</p>
      <div className={styles.radioButtonsContainer}>
        {optionsAndIcons.map((option) => {
          const optionId = option.id;
          const optionText = option.text;
          const optionHintText = option.hintText;
          const optionIcon = option.icon;
          const isSelected = option.active;
          return (
            <RadioButton
              key={optionId}
              id={optionId}
              text={optionText}
              hintText={optionHintText}
              Icon={optionIcon}
              selected={isSelected}
              onClick={onClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RadioInput;
