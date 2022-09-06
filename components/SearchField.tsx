import { useState } from "react";
import styles from "../styles/SearchField.module.scss";
import LoadingWheel from "./LoadingWheel";
import SearchIcon from "./svgs/SearchIcon";

interface SearchFieldProps {
  search: string;
  setSearch: (search: string) => void;
  loading: boolean;
}

export default function SearchField({
  loading,
  search,
  setSearch,
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
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </div>
  );
}
