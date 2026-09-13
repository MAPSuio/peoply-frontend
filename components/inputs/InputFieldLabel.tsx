import styles from "../../styles/TextInputLocationSelect.module.scss";

export interface InputFieldLabelProps {
  inputId: string;
  label?: string;
  required?: boolean;
}

export default function InputFieldLabel({
  inputId,
  label,
  required,
}: InputFieldLabelProps) {
  if (!label) {
    return null;
  }

  if (!required) {
    return (
      <div className={styles.labelContainer}>
        <label className={styles.label} htmlFor={inputId}>
          {`${label} (frivillig)`}
        </label>
      </div>
    );
  }

  return (
    <div className={styles.labelContainer}>
      <label className={`${styles.label} ${styles.required}`} htmlFor={inputId}>
        {label}
        <span className={styles.asterisk}> *</span>
      </label>
    </div>
  );
}
