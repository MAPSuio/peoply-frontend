import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInput.module.scss";
import { useState } from "react";

interface TextInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  maxLength: number;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const TextInput = ({
  value,
  inputId,
  inputName,
  label,
  placeholder,
  maxLength,
  errorMessage,
  required,
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
          minLength={1}
          maxLength={maxLength}
          required={required}
          autoComplete="off"
        ></input>
        {focused && (
          <div className={styles.errorContainer}>
            <ErrorIcon />
            <p className={styles.errorText}>{errorMessage}</p>
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
        minLength={1}
        maxLength={maxLength}
        required={required}
      ></input>
    </div>
  );
};

export default TextInput;
