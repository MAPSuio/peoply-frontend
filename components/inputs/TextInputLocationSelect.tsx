import { Fragment, useEffect, useRef, useState } from "react";

import styles from "../../styles/TextInputLocationSelect.module.scss";
import type {
  LocationSearchOptions,
  LocationSearchResponse,
  LocationSearchResult,
} from "../../types/locationSearch";
import useDebouncedSearch from "../../hooks/useDebouncedSearch";
import { searchLocations } from "../../services/locationSearch";
import ExitIcon from "../svgs/ExitIcon";
import LoadingWheel from "../LoadingWheel";

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
  const [valid, setValid] = useState(false);
  const [locations, setLocations] = useState<LocationSearchResult[]>([]);

  const { results, loading } = useDebouncedSearch(
    search ?? "",
    (query: string): Promise<LocationSearchResponse> =>
      searchLocations(query, options),
    { delayMs: 500, minLength: 1 },
  );

  useEffect(() => {
    setLocations(results?.results ?? []);
  }, [results]);

  /* The result list must close when the user interacts with anything else on
     the page, otherwise it keeps floating over the content below the input. */
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setLocations([]);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query === " ") {
      return;
    }
    setSearch(query);
    setLocations([]);
  };

  return (
    <div className={inputContainerStyles} ref={containerRef}>
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
              type="button"
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
        ) : null}
      </div>
      {locations.length > 0 && (
        <div className={styles.results}>
          {locations.map((location) => (
            <Fragment key={location.id}>
              <span className={styles.divider} />
              <button
                type="button"
                onClick={() => {
                  onLocationSelect(location);
                  setSearch(undefined);
                  setLocations([]);
                }}
              >
                <div className={styles.item}>
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
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default TextInputLocationSelect;
