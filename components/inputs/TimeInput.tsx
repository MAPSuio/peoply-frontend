import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TimeInput.module.scss";
import { laterThanNow } from "../../utils/functions";

interface TimeInputProps {
  value: string;
  valid?: boolean;
  inputId: string;
  inputName: string;
  label: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const TimeInput = ({
  value,
  valid,
  inputId,
  inputName,
  label,
  errorMessage,
  required,
  handleChange,
}: TimeInputProps) => {
  const [focused, setFocused] = useState(false);

  const getInputContainerStyles = () => {
    if (valid || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getTimeInputStyles = () => {
    if (valid) {
      return `${styles.timeInput} ${styles.valid}`;
    } else if (focused && !valid) {
      return `${styles.timeInput} ${styles.notValid}`;
    } else {
      return styles.timeInput;
    }
  };

  const timeInputStyles = getTimeInputStyles();
  const inputContainerStyles = getInputContainerStyles();

  return (
    <div className={inputContainerStyles}>
      <label className={`${styles.label} ${styles.required}`} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={timeInputStyles}
        type="time"
        value={value}
        id={inputId}
        name={inputName}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        required={required}
      ></input>
      {!valid && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
