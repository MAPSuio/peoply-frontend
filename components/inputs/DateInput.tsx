import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import { getISODate, olderThanToday } from "../../utils/functions";
import styles from "../../styles/DateInput.module.scss";

interface DateInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  errorMessage: string;
  handleChange: (e: any) => void;
}

const DateInput = ({
  value,
  inputId,
  inputName,
  label,
  errorMessage,
  handleChange,
}: DateInputProps) => {
  const [focused, setFocused] = useState(false);

  const getDateInputStyles = () => {
    if (focused && validDate) {
      return `${styles.dateInput} ${styles.valid}`;
    } else if (focused && !validDate) {
      return `${styles.dateInput} ${styles.notValid}`;
    } else {
      return styles.dateInput;
    }
  };

  const todayISO = getISODate(new Date());
  const validDate = olderThanToday(new Date(value));
  const dateInputStyles = getDateInputStyles();

  return (
    <div className={styles.inputContainer}>
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
      ></input>
      {!validDate && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DateInput;
