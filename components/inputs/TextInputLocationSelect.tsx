import useLocationSearchField from "../../hooks/useLocationSearchField";
import type {
  LocationSearchOptions,
  LocationSearchResult,
} from "../../types/locationSearch";
import InputFieldLabel from "./InputFieldLabel";
import LocationInputAdornment from "./LocationInputAdornment";
import LocationResultList from "./LocationResultList";

import styles from "../../styles/TextInputLocationSelect.module.scss";

interface TextInputLocationSelectProps {
  inputId: string;
  inputName: string;
  label?: string;
  placeholder: string;
  required?: boolean;
  onLocationSelect: (location?: LocationSearchResult) => void;
  selectedLocation?: LocationSearchResult;
  options?: LocationSearchOptions;
  card?: boolean;
}

function containerStyles(valid: boolean, focused: boolean) {
  const padding = valid || !focused ? styles.noErrorPadding : "";
  return `${styles.inputContainer} ${padding}`.trim();
}

function inputStyles(valid: boolean, focused: boolean, card?: boolean) {
  const invalid = !valid && focused ? styles.notValid : "";
  const cardStyle = card ? styles.card : "";
  return `${styles.textInput} ${invalid} ${cardStyle}`.trim();
}

const TextInputLocationSelect = ({
  inputId,
  inputName,
  label,
  placeholder,
  required,
  onLocationSelect,
  selectedLocation,
  options,
  card,
}: TextInputLocationSelectProps) => {
  const field = useLocationSearchField({
    selectedLocation,
    options,
    onLocationSelect,
  });

  return (
    <div
      className={containerStyles(field.valid, field.focused)}
      ref={field.containerRef}
    >
      <InputFieldLabel inputId={inputId} label={label} required={required} />
      <div className={styles.inputAndIconContainer}>
        <input
          onFocus={field.onFocus}
          onBlur={field.onBlur}
          className={inputStyles(field.valid, field.focused, card)}
          type="text"
          value={field.value}
          id={inputId}
          name={inputName}
          placeholder={placeholder}
          onChange={(event) => field.onSearchChange(event.target.value)}
          required={required}
          autoComplete="off"
        />
        <LocationInputAdornment
          hasSelection={field.valid}
          loading={field.loading}
          onClear={field.onClear}
        />
      </div>
      <LocationResultList
        locations={field.locations}
        onSelect={field.onSelect}
      />
    </div>
  );
};

export default TextInputLocationSelect;
