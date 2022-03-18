import styles from "../../styles/CheckboxInput.module.scss";

interface CheckboxInputProps {
  label: string;
  checkboxId: string;
  checkboxName: string;
  checked?: boolean;
  onChange: () => void;
}

const CheckboxInput = ({
  label,
  checkboxId,
  checkboxName,
  checked,
  onChange,
}: CheckboxInputProps) => {
  return (
    <div className={styles.checkboxContainer}>
      <input
        className={styles.checkbox}
        type="checkbox"
        id={checkboxId}
        name={checkboxName}
        checked={checked}
        onChange={onChange}
      />
      <label className={styles.label} htmlFor={checkboxId}>
        {label}
      </label>
    </div>
  );
};

export default CheckboxInput;
