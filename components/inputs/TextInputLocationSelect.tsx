import { useEffect, useRef, useState } from "react";

import styles from "../../styles/TextInputLocationSelect.module.scss";
import {
  AzureMapsSearchFuzzyOptions,
  AzureMapsSearchFuzzyResponse,
  AzureMapsSearchFuzzyResult,
} from "../../types/azureMaps";
import { searchLocationsFuzzy } from "../../services/maps";
import ExitIcon from "../svgs/ExitIcon";
import LoadingWheel from "../LoadingWheel";

interface TextInputLocationSelectProps {
  inputId: string;
  inputName: string;
  label?: string;
  placeholder: string;
  required?: boolean;
  onLocationSelect: (location?: AzureMapsSearchFuzzyResult) => void;
  selectedLocation?: AzureMapsSearchFuzzyResult;
  options?: AzureMapsSearchFuzzyOptions;
  card?: boolean;
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
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [locations, setLocations] = useState<AzureMapsSearchFuzzyResult[]>([]);

  /* Callers build `options` inline, so a new object identity on every parent
     render would restart the debounce below. A ref keeps the effect reading
     the latest value without depending on it. */
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const inputContainerStyles = (() => {
    if (valid || !focused) {
      return `${styles.inputContainer} ${styles.noErrorPadding}`;
    } else {
      return styles.inputContainer;
    }
  })();

  const textInputStyles = (() => {
    if (valid) {
      return `${styles.textInput} ${card && styles.card}`;
    } else if (focused) {
      return `${styles.textInput} ${styles.notValid} ${card && styles.card}`;
    } else {
      return `${styles.textInput} ${card && styles.card}`;
    }
  })();

  useEffect(() => {
    setValid(Boolean(selectedLocation));
  }, [selectedLocation]);

  /* hook to fetch whenever search term changes */
  useEffect(() => {
    if (!search) {
      return;
    }

    setLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      const result: AzureMapsSearchFuzzyResponse = await searchLocationsFuzzy(
        search,
        optionsRef.current,
      );
      // A slower request for an earlier term must not overwrite the results
      // of a later one.
      if (cancelled) {
        return;
      }
      setLoading(false);
      setLocations(result.results ?? []);
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setLocations([]);

    if (query.length < 1) {
      setLoading(false);
    }
  };

  return (
    <div className={inputContainerStyles}>
      {label && (
        <div className={styles.labelContainer}>
          {required ? (
            <label
              className={`${styles.label} ${styles.required}`}
              htmlFor={inputId}
            >
              {label}
              <span className={styles.asterisk}> *</span>
            </label>
          ) : (
            <label className={styles.label} htmlFor={inputId}>
              {`${label} (frivillig)`}
            </label>
          )}
        </div>
      )}
      <div className={styles.inputAndIconContainer}>
        <input
          onFocus={() => {
            setFocused(true);
            setSearch(undefined);
            setLocations([]);
          }}
          onBlur={() => {
            setFocused(false);
            setSearch(undefined);
          }}
          className={textInputStyles}
          type="text"
          value={search ?? selectedLocation?.address?.freeformAddress ?? ""}
          id={inputId}
          name={inputName}
          placeholder={placeholder}
          onChange={handleChange}
          required={required}
          autoComplete="off"
        />
        {selectedLocation && !loading ? (
          <div className={styles.cancelSearch}>
            <button
              onClick={() => {
                if (!locations.length) onLocationSelect(undefined);
                setSearch(undefined);
                setLocations([]);
              }}
            >
              <ExitIcon />
            </button>
          </div>
        ) : loading ? (
          <div className={styles.loadingCircle}>
            <LoadingWheel />
          </div>
        ) : (
          <></>
        )}
      </div>
      {locations.length > 0 && (
        <div className={styles.results}>
          {locations.map((location) => (
            <>
              <span className={styles.divider} />
              <button
                onClick={() => {
                  onLocationSelect(location);
                  setSearch(undefined);
                  setLocations([]);
                }}
              >
                <div key={location.id} className={styles.item}>
                  {location.poi ? (
                    <>
                      <div>{`${location.poi.name}`}</div>
                      <div>{location.address?.freeformAddress}</div>
                    </>
                  ) : (
                    <div>{location.address?.freeformAddress}</div>
                  )}
                </div>
              </button>
            </>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextInputLocationSelect;
