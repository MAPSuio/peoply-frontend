import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import { getISODate, olderThanToday } from "../../utils/functions";
import styles from "../../styles/DateInput.module.scss";

interface DateInputProps {
  value: string;
  valid?: boolean;
  inputId: string;
  inputName: string;
  label: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const DateInput = ({
  value,
  valid,
  inputId,
  inputName,
  label,
  errorMessage,
  required,
  handleChange,
}: DateInputProps) => {
  const [focused, setFocused] = useState(false);

  const getInputContainerStyles = () => {
    if (valid || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getDateInputStyles = () => {
    if (valid) {
      return `${styles.dateInput} ${styles.valid}`;
    } else if (focused) {
      return `${styles.dateInput} ${styles.notValid}`;
    } else {
      return styles.dateInput;
    }
  };

  const todayISO = getISODate(new Date());
  const dateInputStyles = getDateInputStyles();
  const inputContainerStyles = getInputContainerStyles();

  return (
    <div className={inputContainerStyles}>
      <label className={`${styles.label} ${styles.required}`} htmlFor={inputId}>
        {label}
      </label>
      <input
        className={dateInputStyles}
        type="date"
        value={value}
        id={inputId}
        name={inputName}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        min={todayISO}
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

export default DateInput;
