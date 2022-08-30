/* React. */
import { useState } from "react";

/* Components. */
import Button from "./Button";

/* Types */
import { ButtonType } from "../types/types";

/* Styles */
import styles from "../styles/Modal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  buttonText?: string;
  secondaryButtonText?: string;
  buttonOnClick?: () => void;
  secondaryButtonOnClick?: () => void;
  closeButtonOnclick?: () => void;
}

const Modal = ({
  label,
  description,
  buttonText,
  secondaryButtonText,
  buttonOnClick,
  secondaryButtonOnClick,
  closeButtonOnclick,
}: ModalProps) => {
  const [show, setShow] = useState(true);
  const onClose = () => {
    setShow(false);
  };

  const clickFunction = () => {
    buttonOnClick && buttonOnClick();
    setShow(false);
  };

  const secondaryClickFunction = () => {
    secondaryButtonOnClick && secondaryButtonOnClick();
    setShow(false);
  };

  if (show) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <button
            className={styles.exitIcon}
            onClick={closeButtonOnclick ?? onClose}
          >
            <ExitIcon />
          </button>
          <h1 className={styles.title}>{label}</h1>
          <p className={styles.description}>{description}</p>
          {buttonText && (
            <Button
              className={styles.button}
              text={buttonText}
              onClick={clickFunction}
              noShadow
            />
          )}
          {secondaryButtonText && (
            <Button
              type={ButtonType.SECONDARY}
              className={styles.button}
              text={secondaryButtonText}
              onClick={secondaryClickFunction}
              noShadow
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
