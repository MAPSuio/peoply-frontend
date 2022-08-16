import { ChangeEvent, useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInput.module.scss";

interface TextInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  errorMessage: string;
  required?: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const TextInput = ({
  value,
  inputId,
  inputName,
  label,
  placeholder,
  maxLength,
  minLength,
  errorMessage,
  required,
  handleChange,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  const validText =
    minLength && maxLength
      ? value.length >= minLength && value.length <= maxLength
      : minLength
      ? value.length >= minLength
      : maxLength
      ? value.length <= maxLength
      : true;

  const getInputContainerStyles = () => {
    if (validText || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getTextInputStyles = () => {
    if (validText) {
      return `${styles.textInput} ${styles.valid}`;
    } else if (focused) {
      return `${styles.textInput} ${styles.notValid}`;
    } else {
      return `${styles.textInput}`;
    }
  };

  const textInputStyles = getTextInputStyles();
  const inputContainerStyles = getInputContainerStyles();

  return (
    <div className={inputContainerStyles}>
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
        className={textInputStyles}
        type="text"
        value={value}
        id={inputId}
        name={inputName}
        placeholder={placeholder}
        onChange={handleChange}
        onClick={() => setFocused(true)}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        autoComplete="off"
      ></input>
      {!validText && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextInput;
