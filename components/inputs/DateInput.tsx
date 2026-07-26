import { type ChangeEvent, useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import { getISODate } from "../../utils/functions";
import styles from "../../styles/DateInput.module.scss";

interface DateInputProps {
  value: string;
  valid?: boolean;
  inputId: string;
  inputName: string;
  label?: string;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  initiallyFocused?: boolean;
  noExtraInfo?: boolean;
  card?: boolean;
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
  initiallyFocused = false,
  noExtraInfo,
  card,
}: DateInputProps) => {
  const [focused, setFocused] = useState(initiallyFocused);

  const getInputContainerStyles = () => {
    if (valid || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getDateInputStyles = () => {
    if (valid) {
      return `${styles.dateInput} ${card && styles.card}`;
    } else if (focused) {
      return `${styles.dateInput} ${styles.notValid} ${card && styles.card}`;
    } else {
      return `${styles.dateInput} ${card && styles.card}`;
    }
  };

  const todayISO = getISODate(new Date());
  const dateInputStyles = getDateInputStyles();
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
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DateInput;
