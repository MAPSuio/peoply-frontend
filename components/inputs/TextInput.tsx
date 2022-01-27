import { ChangeEvent, useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInput.module.scss";

interface TextInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder: string;
  maxLength: number;
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
  errorMessage,
  required,
  handleChange,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  const validText = value.length > 0;

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
        minLength={1}
        maxLength={maxLength}
        required={required}
        autoComplete="off"
      ></input>
      {!validText && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextInput;
