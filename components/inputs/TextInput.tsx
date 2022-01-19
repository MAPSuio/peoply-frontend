import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInput.module.scss";
import { useState } from "react";
import { notDeepEqual } from "assert";

interface TextInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  maxLength: number;
  handleChange: (e: any) => void;
}

const TextInput = ({
  value,
  inputId,
  inputName,
  label,
  placeholder,
  maxLength,
  handleChange,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  const inputNotValidStyles = focused
    ? `${styles.textInput} ${styles.notValid}`
    : `${styles.textInput}`;

  if (value.length === 0) {
    return (
      <div className={styles.inputContainer}>
        <div className={styles.labelContainer}>
          <label
            className={`${styles.label} ${styles.required}`}
            htmlFor={inputId}
          >
            {label}
          </label>
          <p className={styles.lengthText}>{`${value.length}/${maxLength}`}</p>
        </div>
        <input
          className={inputNotValidStyles}
          type="text"
          value={value}
          id={inputId}
          name={inputName}
          placeholder={placeholder}
          onChange={handleChange}
          onClick={() => setFocused(true)}
        ></input>
        {focused && (
          <div className={styles.errorContainer}>
            <ErrorIcon />
            <p className={styles.errorText}>Tittelen kan ikke være tom.</p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={styles.inputContainer}>
      <div className={styles.labelContainer}>
        <label
          className={`${styles.label} ${styles.required}`}
          htmlFor={inputId}
        >
          {label}
        </label>
        <p className={styles.lengthText}>{`${value.length}/${maxLength}`}</p>
      </div>
      <input
        className={`${styles.textInput} ${styles.valid}`}
        type="text"
        value={value}
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={() => setFocused(true)}
      ></input>
    </div>
  );
};

export default TextInput;
