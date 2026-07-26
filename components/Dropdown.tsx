import styles from "../.../../styles/Dropdown.module.scss";

interface DropdownProps<T extends string | number | null | undefined> {
  label?: string;
  options: { value: T; label: string; isDefault?: boolean }[];
  // Accepts a plain string too: some callers fall back to "" for display
  // purposes (e.g. `value={foodPreference ?? ""}`) while T itself never
  // takes that value - setValue/options stay strictly T.
  value: T | string;
  inputId: string;
  setValue: (value: T) => void;
  className?: string;
  card?: boolean;
}

export default function Dropdown<T extends string | number | null | undefined>({
  label,
  options,
  value,
  inputId,
  setValue,
  className,
  card,
}: DropdownProps<T>) {
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
        className={`${styles.dropdown} ${card && styles.card}`}
        name={label}
        id={inputId}
        value={value ?? ""}
        // Native <select> onChange only ever hands back a string; casting
        // to T trusts the caller-supplied options to actually be strings
        // (or string-like) matching T, same contract as e.g. Number(e.target.value).
        onChange={(e) => setValue(e.target.value as T)}
      >
        {options.map(({ value, label, isDefault }) => (
          <option
            key={String(value)}
            value={value ?? ""}
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
