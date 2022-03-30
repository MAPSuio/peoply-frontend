import styles from "../../styles/CheckboxInput.module.scss";

interface CheckboxInputProps {
  label: string;
  checkboxId: string;
  checkboxName: string;
  checked?: boolean;
  disabled?: boolean;
  className?: string;
  onChange: () => void;
}

const CheckboxInput = ({
  label,
  checkboxId,
  checkboxName,
  checked,
  disabled,
  className,
  onChange,
}: CheckboxInputProps) => {
  return (
    <div className={`${styles.checkboxContainer} ${className && className}`}>
      <input
        className={styles.checkbox}
        type="checkbox"
        id={checkboxId}
        name={checkboxName}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <label
        className={`${styles.label} ${disabled && styles.disabled}`}
        htmlFor={checkboxId}
      >
        {label}
      </label>
    </div>
  );
};

export default CheckboxInput;
