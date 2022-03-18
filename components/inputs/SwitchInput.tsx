/* Styles. */
import styles from "../../styles/SwitchInput.module.scss";

interface SwitchInputProps {
  label: string;
  checked?: boolean;
  onClick?: () => void;
}

const SwitchInput = ({ label, checked, onClick }: SwitchInputProps) => {
  return (
    <div className={styles.switchContainer}>
      <span className={styles.label}>{label}</span>
      <button
        className={`${styles.switch} ${checked && styles.checked}`}
        onClick={onClick}
      >
        <span className={styles.switchControl} />
      </button>
    </div>
  );
};
export default SwitchInput;
