import { useState } from "react";
import styles from "../styles/SearchField.module.scss";
import LoadingWheel from "./LoadingWheel";
import SearchIcon from "./svgs/SearchIcon";

interface SearchFieldProps {
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
  /* The field has no visible label - only a magnifier icon - so callers must
     say what it searches. Several can be on screen at once. */
  label: string;
}

export default function SearchField({
  loading,
  search,
  setSearch,
  label,
}: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.inputContainer} ${focused ? styles.focused : ""}`}
      >
        {loading ? <LoadingWheel /> : <SearchIcon />}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label={label}
        />
      </div>
    </div>
  );
}
