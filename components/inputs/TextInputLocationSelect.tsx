import { useEffect, useState } from "react";

import styles from "../../styles/TextInputLocationSelect.module.scss";
import { Models, SearchFuzzyOptions } from "azure-maps-rest";
import { searchLocationsFuzzy } from "../../services/maps";
import ExitIcon from "../svgs/ExitIcon";
import LoadingWheel from "../LoadingWheel";

interface TextInputLocationSelectProps {
  inputId: string;
  inputName: string;
  label?: string;
  placeholder: string;
  required?: boolean;
  onLocationSelect: (location?: Models.SearchFuzzyResult) => void;
  selectedLocation?: Models.SearchFuzzyResult;
  options?: SearchFuzzyOptions;
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
  const [locations, setLocations] = useState<Models.SearchFuzzyResult[]>([]);
  const [queuedSearch, setQueuedSearch] =
    useState<ReturnType<typeof setTimeout>>();

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

  /* hook to fetch whenever search term changes */
  useEffect(() => {
    if (selectedLocation) {
      setValid(true);
    } else {
      setValid(false);
    }
    const performSearch = async () => {
      if (search) {
        const result: Models.SearchFuzzyResponse = await searchLocationsFuzzy(
          search,
          options,
        );

        const fetchedLocations = result.results ?? [];
        setLoading(false);
        setLocations(fetchedLocations);
      }
    };
    if (search) {
      setLoading(true);
      const req: ReturnType<typeof setTimeout> = setTimeout(
        () => performSearch(),
        500,
      );
      setQueuedSearch(req);
    }
  }, [options, search, selectedLocation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setLocations([]);
    if (queuedSearch) {
      clearTimeout(queuedSearch);
    }

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
