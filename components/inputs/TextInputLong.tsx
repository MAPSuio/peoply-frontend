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
  className?: string;
  handleChange: (e: any) => void;
  validate?: boolean;
  valid?: boolean;
  setValid?: React.Dispatch<React.SetStateAction<boolean>>;
  noExtraInfo?: boolean;
  card?: boolean;
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
  className,
  required,
  handleChange,
  validate,
  valid,
  setValid,
  noExtraInfo,
  card,
}: TextInputLongProps) => {
  const [focused, setFocused] = useState(false);

  if (setValid) {
    setValid(value.length > 0);
  }

  const getInputContainerStyles = () => {
    if (validate && (valid || !focused)) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  };

  const getTextInputLongStyles = () => {
    if (validate && valid) {
      return `${styles.textInputLong} ${card && styles.card}`;
    } else if (validate && focused) {
      return `${styles.textInputLong} ${styles.notValid} ${
        card && styles.card
      }`;
    } else {
      return `${styles.textInputLong} ${card && styles.card}`;
    }
  };

  const getLabelValidStyles = () => {
    if (validate && valid && value.length) {
      return styles.labelValid;
    }
  };

  const labelValidStyles = getLabelValidStyles();

  const textInputLongStyles = getTextInputLongStyles();
  const inputContainerStyles = getInputContainerStyles();

  return (
    <div className={`${inputContainerStyles} ${className}`}>
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
      {validate && !valid && focused && (
        <div className={styles.errorContainer}>
          <ErrorIcon className={styles.errorIcon} />
          <p className={styles.errorText}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default TextInputLong;
