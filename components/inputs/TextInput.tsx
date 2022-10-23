import { ChangeEvent, useState } from "react";

import ErrorIcon from "../svgs/ErrorIcon";

import styles from "../../styles/TextInput.module.scss";
import { isValidEmail } from "../../utils/functions";

interface TextInputProps {
  value: string;
  inputId: string;
  inputName: string;
  label: string;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  errorMessage?: string;
  required?: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  setValid?: React.Dispatch<React.SetStateAction<boolean>>;
  valid?: boolean;
  validate?: boolean;
  isEmail?: boolean;
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
  setValid,
  valid,
  validate,
  isEmail,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  if (setValid) {
    const validLength =
      minLength && maxLength
        ? value.length >= minLength && value.length <= maxLength
        : minLength
        ? value.length >= minLength
        : maxLength
        ? value.length <= maxLength
        : true;
    const validEmail = value.length && isEmail ? isValidEmail(value) : true;
    setValid(validLength && validEmail);
  }

  const getInputContainerStyles = () => {
    if (validate && (valid || !focused)) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getTextInputStyles = () => {
    if (validate && valid && value.length) {
      return `${styles.textInput} ${styles.valid}`;
    } else if (validate && focused && (required || value.length)) {
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
      {validate && !valid && focused && errorMessage && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextInput;
