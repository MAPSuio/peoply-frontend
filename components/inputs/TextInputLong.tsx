import { useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInputLong.module.scss";

interface TextInputLongProps {
  value: string;
  inputId: string;
  inputName: string;
  rows?: number;
  label: string;
  placeholder: string;
  maxLength: number;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: any) => void;
}

const TextInputLong = ({
  value,
  inputId,
  inputName,
  rows,
  label,
  placeholder,
  maxLength,
  errorMessage,
  required,
  handleChange,
}: TextInputLongProps) => {
  const [focused, setFocused] = useState(false);

  const getTextInputLongStyles = () => {
    if (focused && validText) {
      return `${styles.textInputLong} ${styles.valid}`;
    } else if (focused && !validText) {
      return `${styles.textInputLong} ${styles.notValid}`;
    } else {
      return styles.textInputLong;
    }
  };

  const validText = value.length > 0;
  const textInputLongStyles = getTextInputLongStyles();

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
      <textarea
        className={textInputLongStyles}
        value={value}
        id={inputId}
        name={inputName}
        rows={rows}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        minLength={1}
        maxLength={maxLength}
        required={required}
      ></textarea>
      {!validText && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextInputLong;
