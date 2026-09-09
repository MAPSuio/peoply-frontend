import { Fragment } from "react";

import type { LocationSearchResult } from "../../types/locationSearch";

import styles from "../../styles/TextInputLocationSelect.module.scss";

export interface LocationResultListProps {
  locations: LocationSearchResult[];
  onSelect: (location: LocationSearchResult) => void;
}

export default function LocationResultList({
  locations,
  onSelect,
}: LocationResultListProps) {
  if (locations.length === 0) {
    return null;
  }

  return (
    <div className={styles.results}>
      {locations.map((location) => (
        <Fragment key={location.id}>
          <span className={styles.divider} />
          <button type="button" onClick={() => onSelect(location)}>
            <div className={styles.item}>
              {location.poi && <div>{location.poi.name}</div>}
              <div>{location.address?.freeformAddress}</div>
            </div>
          </button>
        </Fragment>
      ))}
    </div>
  );
}
