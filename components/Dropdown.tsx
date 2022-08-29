import styles from "../.../../styles/Dropdown.module.scss";

interface DropdownProps {
  label?: string;
  options: { value: any; label: string }[];
  value: any;
  inputId: string;
  setValue: (value: any) => void;
  className?: string;
}

export default function Dropdown({
  label,
  options,
  value,
  inputId,
  setValue,
  className,
}: DropdownProps) {
  return (
    <div className={className}>
      {label && (
        <div className={styles.labelContainer}>
          <label
            className={`${styles.label} ${styles.required}`}
            htmlFor={inputId}
          >
            {label}
          </label>
        </div>
      )}
      <select
        className={styles.dropdown}
        name={label}
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
