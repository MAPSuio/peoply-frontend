/* Components. */
import RadioButtonSmall from "../RadioButtonSmall";

/* Styles. */
import styles from "../../styles/RadioInputSmall.module.scss";
import React from "react";

interface RadioInputSmallProps {
  optionsAndIcons: Array<{
    id: number;
    text: string;
    hintText?: string;
    icon: React.FunctionComponent;
    active: boolean;
  }>;
  label: string;
  onClick: (id: number) => void;
}

const RadioInputSmall = ({
  optionsAndIcons,
  label,
  onClick,
}: RadioInputSmallProps) => {
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
            <RadioButtonSmall
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

export default RadioInputSmall;
