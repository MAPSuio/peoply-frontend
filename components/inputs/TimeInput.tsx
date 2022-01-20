import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TimeInput.module.scss";
import { getISOTime, laterThanNow } from "../../utils/functions";

interface TimeInputProps {
  value: string;
  date: string;
  inputId: string;
  inputName: string;
  label: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const TimeInput = ({
  value,
  date,
  inputId,
  inputName,
  label,
  errorMessage,
  required,
  handleChange,
}: TimeInputProps) => {
  const [focused, setFocused] = useState(false);

  const getTimeInputStyles = () => {
    if (focused && validTime) {
      return `${styles.timeInput} ${styles.valid}`;
    } else if (focused && !validTime) {
      return `${styles.timeInput} ${styles.notValid}`;
    } else {
      return styles.timeInput;
    }
  };

  const validTime = laterThanNow(date, value);
  const timeInputStyles = getTimeInputStyles();

  return (
    <div className={styles.inputContainer}>
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
      {!validTime && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
