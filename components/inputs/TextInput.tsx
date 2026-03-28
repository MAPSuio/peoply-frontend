import { ChangeEvent, useEffect, useState } from "react";

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
  regExp?: RegExp; // if you want to use a custom regex for validation
  whiteList?: string[]; // if you want to use a custom whitelist for validation
  noExtraInfo?: boolean;
  card?: boolean;
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
  regExp,
  whiteList,
  noExtraInfo,
  card,
}: TextInputProps) => {
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!setValid) {
      return;
    }

    const validLength =
      minLength && maxLength
        ? value.length >= minLength && value.length <= maxLength
        : minLength
        ? value.length >= minLength
        : maxLength
        ? value.length <= maxLength
        : true;
    const validEmail = isEmail ? isValidEmail(value) : true;
    const validRegExp = regExp ? regExp.test(value) : true;
    const inWhiteList = whiteList ? whiteList.includes(value) : false;

    setValid((validLength && validEmail && validRegExp) || inWhiteList);
  }, [isEmail, maxLength, minLength, regExp, setValid, value, whiteList]);

  const getInputContainerStyles = () => {
    if (validate && (valid || !focused)) {
      return `${styles.inputContainer} ${styles.noErrorPadding}
      }`;
    } else {
      return `${styles.inputContainer}`;
    }
  };

  const getTextInputStyles = () => {
    if (validate && valid && value.length) {
      return `${styles.textInput} ${card && styles.card}`;
    } else if (validate && focused && (required || value.length)) {
      return `${styles.textInput} ${styles.notValid} ${card && styles.card}`;
    } else {
      return `${styles.textInput} ${card && styles.card}`;
    }
  };

  const getLabelValidStyles = () => {
    if (validate && valid && value.length) {
      return styles.labelValid;
    }
  };

  const textInputStyles = getTextInputStyles();
  const inputContainerStyles = getInputContainerStyles();
  const labelValidStyles = getLabelValidStyles();

  return (
    <div className={inputContainerStyles}>
      <div className={`${styles.labelContainer} ${labelValidStyles}`}>
        {required ? (
          <label
            className={`${styles.label} ${styles.required}`}
            htmlFor={inputId}
          >
            {label}
            {!noExtraInfo && <span className={styles.asterisk}> *</span>}
          </label>
        ) : (
          <label className={styles.label} htmlFor={inputId}>
            {`${label} ${!noExtraInfo ? "(frivillig)" : ""}`}
          </label>
        )}
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
