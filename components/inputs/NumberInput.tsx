import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/NumberInput.module.scss";
import { useState } from "react";

interface NumberInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  max?: string;
  min?: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const NumberInput = ({
  value,
  inputId,
  inputName,
  label,
  placeholder,
  max,
  min = "0",
  errorMessage,
  required,
  handleChange,
}: NumberInputProps) => {
  const [focused, setFocused] = useState(false);

  // a number is valid if it is greater than 0 and less than or equal to max if max exists
  let validNumber = parseInt(value) > 0;
  if (max) {
    validNumber = validNumber && parseInt(value) <= parseInt(max);
  }

  const getInputContainerStyles = () => {
    if (validNumber || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getNumberInputStyles = () => {
    if (focused && validNumber) {
      return styles.numberInput;
    } else if (focused && !validNumber) {
      return `${styles.numberInput} ${styles.notValid}`;
    } else {
      return styles.numberInput;
    }
  };

  const getLabelValidStyles = () => {
    if (validNumber) {
      return styles.labelValid;
    }
  };

  const numberInputStyles = getNumberInputStyles();
  const inputContainerStyles = getInputContainerStyles();
  const labelValidStyles = getLabelValidStyles();

  return (
    <div className={inputContainerStyles}>
      <div className={`${styles.labelContainer} ${labelValidStyles}`}>
        {required ? (
          <label
            className={`${styles.label} ${styles.required}`}
            htmlFor={inputId}
          >
            {label}
            <span className={styles.asterisk}> *</span>
          </label>
        ) : (
          <label className={styles.label} htmlFor={inputId}>
            {`${label} (frivillig)`}
          </label>
        )}
      </div>
      <input
        className={numberInputStyles}
        type="number"
        value={value}
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        min={min}
        max={max}
        required={required}
        autoComplete="off"
      ></input>
      {!validNumber && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
