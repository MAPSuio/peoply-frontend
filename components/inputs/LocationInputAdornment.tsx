import LoadingWheel from "../LoadingWheel";
import ExitIcon from "../svgs/ExitIcon";

import styles from "../../styles/TextInputLocationSelect.module.scss";

export interface LocationInputAdornmentProps {
  hasSelection: boolean;
  loading: boolean;
  onClear: () => void;
}

export default function LocationInputAdornment({
  hasSelection,
  loading,
  onClear,
}: LocationInputAdornmentProps) {
  if (hasSelection && !loading) {
    return (
      <div className={styles.cancelSearch}>
        <button type="button" onClick={onClear}>
          <ExitIcon />
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loadingCircle}>
        <LoadingWheel />
      </div>
    );
  }

  return null;
}
