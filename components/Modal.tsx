/* React. */
import { useState } from "react";

/* Components. */
import PrimaryButton from "./PrimaryButton";

/* Types */
import { ModalTypes } from "../types/types";

/* Styles */
import styles from "../styles/Modal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  type?: ModalTypes;
  buttonText?: string;
  secondaryButtonText?: string;
  buttonOnClick?: () => void;
  secondaryButtonOnClick?: () => void;
}

const Modal = ({
  label,
  description,
  type,
  buttonText,
  secondaryButtonText,
  buttonOnClick,
  secondaryButtonOnClick,
}: ModalProps) => {
  const [show, setShow] = useState(true);

  const getButtonStyles = () => {
    switch (type) {
      case ModalTypes.SUCCESS:
        return `${styles.button} ${styles.success}`;
      case ModalTypes.DANGER:
        return `${styles.button} ${styles.danger}`;
      case ModalTypes.WARNING:
        return `${styles.button} ${styles.warning}`;
      default:
        return styles.button;
    }
  };

  const clickFunction = () => {
    buttonOnClick && buttonOnClick();
    setShow(false);
  };

  const secondaryClickFunction = () => {
    secondaryButtonOnClick && secondaryButtonOnClick();
    setShow(false);
  };
  const buttonStyles = getButtonStyles();

  if (show) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <button className={styles.exitIcon} onClick={() => setShow(false)}>
            <ExitIcon />
          </button>
          <h1 className={styles.title}>{label}</h1>
          <p className={styles.description}>{description}</p>
          {buttonText && (
            <PrimaryButton
              className={buttonStyles}
              text={buttonText}
              onClick={clickFunction}
            />
          )}
          {secondaryButtonText && (
            <PrimaryButton
              className={buttonStyles}
              text={secondaryButtonText}
              onClick={secondaryClickFunction}
            />
          )}
        </div>
      </div>
    );
  } else {
    return null;
  }
};

export default Modal;
