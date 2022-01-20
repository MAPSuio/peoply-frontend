import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/NumberInput.module.scss";
import { useState } from "react";

interface NumberInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  max: string;
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
  errorMessage,
  required,
  handleChange,
}: NumberInputProps) => {
  const [focused, setFocused] = useState(false);

  const getNumberInputStyles = () => {
    if (focused && validNumber) {
      return `${styles.numberInput} ${styles.valid}`;
    } else if (focused && !validNumber) {
      return `${styles.numberInput} ${styles.notValid}`;
    } else {
      return styles.numberInput;
    }
  };

  const validNumber = parseInt(value) > 0;
  const numberInputStyles = getNumberInputStyles();

  return (
    <div className={styles.inputContainer}>
      <label className={`${styles.label} ${styles.required}`} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={numberInputStyles}
        type="number"
        value={value}
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        min={1}
        max={max}
        required={required}
        autoComplete="off"
      ></input>
      {!validNumber && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
