import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TimeInput.module.scss";

interface TimeInputProps {
  value: string;
  valid?: boolean;
  inputId: string;
  inputName: string;
  label?: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
  initiallyFocused?: boolean;
  noExtraInfo?: boolean;
  card?: boolean;
}

const TimeInput = ({
  value,
  valid = true,
  inputId,
  inputName,
  label,
  errorMessage,
  required,
  handleChange,
  initiallyFocused = false,
  noExtraInfo,
  card,
}: TimeInputProps) => {
  const [focused, setFocused] = useState(initiallyFocused);

  const getInputContainerStyles = () => {
    if (valid || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getTimeInputStyles = () => {
    if (valid) {
      return `${styles.timeInput} ${card && styles.card}`;
    } else if (focused && !valid) {
      return `${styles.timeInput} ${styles.notValid} ${card && styles.card}`;
    } else {
      return `${styles.timeInput} ${card && styles.card}`;
    }
  };

  const timeInputStyles = getTimeInputStyles();
  const inputContainerStyles = getInputContainerStyles();

  return (
    <div className={inputContainerStyles}>
      {label && required ? (
        <label
          className={`${styles.label} ${styles.required}`}
          htmlFor={inputId}
        >
          {label}
          {!noExtraInfo && (
            <span
              className={`${styles.asterisk} ${valid && styles.labelValid}`}
            >
              {" "}
              *
            </span>
          )}
        </label>
      ) : (
        label && (
          <label className={styles.label} htmlFor={inputId}>
            {`${label} ${!noExtraInfo ? "(frivillig)" : ""}`}
          </label>
        )
      )}
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
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
