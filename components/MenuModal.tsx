/* Styles */
import styles from "../styles/MenuModal.module.scss";
import ExitIcon from "./svgs/ExitIcon";

interface ModalProps {
  label: string;
  description?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

const MenuModal = ({ label, description, onClose, children }: ModalProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <button type="button" className={styles.exitIcon} onClick={onClose}>
          <ExitIcon />
        </button>
        <h1 className={styles.title}>{label}</h1>
        <p className={styles.description}>{description}</p>
        {children}
      </div>
    </div>
  );
};

export default MenuModal;
