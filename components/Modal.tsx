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
  closeButtonOnClick?: () => void;
  danger?: boolean;
}

const Modal = ({
  label,
  description,
  buttonText,
  secondaryButtonText,
  buttonOnClick,
  secondaryButtonOnClick,
  closeButtonOnClick,
  danger,
}: ModalProps) => {
  const clickFunction = () => {
    buttonOnClick && buttonOnClick();
  };

  const secondaryClickFunction = () => {
    secondaryButtonOnClick && secondaryButtonOnClick();
  };

  return (
    <div className={styles.wrapper} onClick={closeButtonOnClick}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.exitIcon} onClick={closeButtonOnClick}>
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
            type={danger ? ButtonType.DANGER : ButtonType.PRIMARY}
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
};

export default Modal;
