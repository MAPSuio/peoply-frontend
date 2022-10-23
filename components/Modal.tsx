/* Styles */
import styles from "../styles/Modal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  closeButtonOnClick?: () => void;
  children?: JSX.Element;
}

const Modal = ({
  label,
  description,
  closeButtonOnClick,
  children,
}: ModalProps) => {
  const closeClickFunction = (e: any) => {
    e.preventDefault();
    closeButtonOnClick && closeButtonOnClick();
  };

  return (
    <div className={styles.wrapper} onClick={closeClickFunction}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.exitIcon} onClick={closeClickFunction}>
          <ExitIcon />
        </button>
        <h1 className={styles.title}>{label}</h1>
        <p className={styles.description}>{description}</p>
        {children}
      </div>
    </div>
  );
};

export default Modal;
