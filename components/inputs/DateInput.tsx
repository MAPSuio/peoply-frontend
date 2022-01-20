import styles from "../../styles/DateInput.module.scss";
import { useState } from "react";

import { getISODate } from "../../utils/functions";

interface DateInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  handleChange: (e: any) => void;
}

const DateInput = ({
  value,
  inputId,
  inputName,
  label,
  handleChange,
}: DateInputProps) => {
  const [focused, setFocused] = useState(false);

  const today = getISODate(new Date());

  const dateInputStyles = focused
    ? `${styles.dateInput} ${styles.valid}`
    : `${styles.dateInput}`;

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
        min={today}
      ></input>
    </div>
  );
};

export default DateInput;
