import styles from "../.../../styles/Dropdown.module.scss";

interface DropdownProps {
  label?: string;
  options: { value: any; label: string; isDefault?: boolean }[];
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
        {options.map(({ value, label, isDefault }) => (
          <option
            key={value}
            value={value}
            disabled={isDefault}
            hidden={isDefault}
          >
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
